package com.music.player

import android.content.ContentUris
import android.content.pm.PackageManager
import android.database.Cursor
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

class MediaScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun getName(): String = "MediaScannerModule"

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        try {
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(
                    context,
                    android.Manifest.permission.READ_MEDIA_AUDIO
                ) == PackageManager.PERMISSION_GRANTED
            } else {
                ContextCompat.checkSelfPermission(
                    context,
                    android.Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun scanAudioFiles(promise: Promise) {
        scope.launch {
            try {
                val results = Arguments.createArray()
                val seenPaths = HashSet<String>()

                // 1. Query Android MediaStore
                val projection = arrayOf(
                    MediaStore.Audio.Media._ID,
                    MediaStore.Audio.Media.TITLE,
                    MediaStore.Audio.Media.ARTIST,
                    MediaStore.Audio.Media.ALBUM,
                    MediaStore.Audio.Media.DURATION,
                    MediaStore.Audio.Media.DATA,
                    MediaStore.Audio.Media.ALBUM_ID,
                    MediaStore.Audio.Media.SIZE
                )

                val selection = "(${MediaStore.Audio.Media.IS_MUSIC} != 0) OR " +
                        "(${MediaStore.Audio.Media.DATA} LIKE '%.mp3') OR " +
                        "(${MediaStore.Audio.Media.DATA} LIKE '%.m4a') OR " +
                        "(${MediaStore.Audio.Media.DATA} LIKE '%.flac') OR " +
                        "(${MediaStore.Audio.Media.DATA} LIKE '%.wav')"

                val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"

                val contentResolver = context.contentResolver
                var cursor: Cursor? = null

                try {
                    cursor = contentResolver.query(
                        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                        projection,
                        selection,
                        null,
                        sortOrder
                    )

                    cursor?.let {
                        val idColumn = it.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                        val titleColumn = it.getColumnIndex(MediaStore.Audio.Media.TITLE)
                        val artistColumn = it.getColumnIndex(MediaStore.Audio.Media.ARTIST)
                        val albumColumn = it.getColumnIndex(MediaStore.Audio.Media.ALBUM)
                        val durationColumn = it.getColumnIndex(MediaStore.Audio.Media.DURATION)
                        val dataColumn = it.getColumnIndex(MediaStore.Audio.Media.DATA)
                        val albumIdColumn = it.getColumnIndex(MediaStore.Audio.Media.ALBUM_ID)
                        val sizeColumn = it.getColumnIndex(MediaStore.Audio.Media.SIZE)

                        while (it.moveToNext()) {
                            val id = it.getLong(idColumn)
                            val dataPath = if (dataColumn != -1) it.getString(dataColumn) ?: "" else ""
                            val size = if (sizeColumn != -1) it.getLong(sizeColumn) else 0L

                            // Skip files under 100KB (typically ringtones/notifications)
                            if (size in 1..102400) continue

                            val rawTitle = if (titleColumn != -1) it.getString(titleColumn) else null
                            val rawArtist = if (artistColumn != -1) it.getString(artistColumn) else null
                            val rawAlbum = if (albumColumn != -1) it.getString(albumColumn) else null
                            val durationMs = if (durationColumn != -1) it.getLong(durationColumn) else 0L

                            val title = if (!rawTitle.isNullOrBlank()) rawTitle else {
                                if (dataPath.isNotBlank()) File(dataPath).nameWithoutExtension else "Track $id"
                            }

                            val artist = if (!rawArtist.isNullOrBlank() && rawArtist != "<unknown>") rawArtist else "Unknown Artist"
                            val album = if (!rawAlbum.isNullOrBlank() && rawAlbum != "<unknown>") rawAlbum else "Unknown Album"
                            val durationSec = if (durationMs > 0) Math.round(durationMs / 1000.0).toInt() else 0

                            val contentUri = ContentUris.withAppendedId(
                                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                                id
                            ).toString()

                            val albumId = if (albumIdColumn != -1) it.getLong(albumIdColumn) else -1L
                            val artworkUri = if (albumId > 0) {
                                ContentUris.withAppendedId(
                                    Uri.parse("content://media/external/audio/albumart"),
                                    albumId
                                ).toString()
                            } else {
                                ""
                            }

                            val playableUrl = if (dataPath.isNotBlank() && File(dataPath).exists()) {
                                Uri.fromFile(File(dataPath)).toString()
                            } else {
                                contentUri
                            }

                            if (dataPath.isNotBlank()) {
                                seenPaths.add(dataPath.lowercase())
                            }

                            val trackMap = Arguments.createMap().apply {
                                putString("id", "local_$id")
                                putString("title", title)
                                putString("artist", artist)
                                putString("album", album)
                                putInt("duration", durationSec)
                                putString("url", playableUrl)
                                putString("contentUri", contentUri)
                                putString("filePath", dataPath)
                                putString("artwork", artworkUri)
                                putDouble("size", size.toDouble())
                                putBoolean("isLocal", true)
                            }

                            results.pushMap(trackMap)
                        }
                    }
                } catch (e: Exception) {
                    Log.e("MediaScanner", "Error querying MediaStore: ${e.message}", e)
                } finally {
                    cursor?.close()
                }

                // 2. Direct folder fallback for unindexed files in Music & Download folders
                scanCommonDirectories(results, seenPaths)

                Log.i("MediaScanner", "Scanned ${results.size()} local audio files")
                promise.resolve(results)
            } catch (e: Exception) {
                Log.e("MediaScanner", "scanAudioFiles error: ${e.message}", e)
                promise.reject("SCAN_ERROR", e.message)
            }
        }
    }

    private fun scanCommonDirectories(results: WritableArray, seenPaths: HashSet<String>) {
        val candidateDirs = listOf(
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC),
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
            File(Environment.getExternalStorageDirectory(), "Music"),
            File(Environment.getExternalStorageDirectory(), "Download")
        )

        val supportedExtensions = setOf("mp3", "m4a", "flac", "wav")

        for (dir in candidateDirs) {
            if (dir != null && dir.exists() && dir.isDirectory) {
                scanDirRecursive(dir, results, seenPaths, supportedExtensions, 0)
            }
        }
    }

    private fun scanDirRecursive(
        dir: File,
        results: WritableArray,
        seenPaths: HashSet<String>,
        supportedExtensions: Set<String>,
        depth: Int
    ) {
        if (depth > 3) return // Avoid deeply nested folders
        val files = dir.listFiles() ?: return

        for (file in files) {
            if (file.isDirectory && !file.name.startsWith(".")) {
                scanDirRecursive(file, results, seenPaths, supportedExtensions, depth + 1)
            } else if (file.isFile) {
                val ext = file.extension.lowercase()
                val path = file.absolutePath.lowercase()

                if (supportedExtensions.contains(ext) && !seenPaths.contains(path)) {
                    if (file.length() < 102400) continue // Skip under 100KB

                    seenPaths.add(path)
                    val id = "file_${file.name.hashCode().toLong() and 0x7fffffffL}"
                    val title = file.nameWithoutExtension
                    var artist = "Local Device"
                    var durationSec = 180

                    try {
                        val retriever = MediaMetadataRetriever()
                        retriever.setDataSource(file.absolutePath)
                        val metaTitle = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE)
                        val metaArtist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST)
                        val metaDuration = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)

                        if (!metaTitle.isNullOrBlank()) title.apply { }
                        if (!metaArtist.isNullOrBlank()) artist = metaArtist
                        metaDuration?.toLongOrNull()?.let { ms ->
                            durationSec = Math.round(ms / 1000.0).toInt()
                        }
                        retriever.release()
                    } catch (e: Exception) {
                        // MediaMetadataRetriever failed, use defaults
                    }

                    val trackMap = Arguments.createMap().apply {
                        putString("id", "local_$id")
                        putString("title", title)
                        putString("artist", artist)
                        putString("album", "Device Storage")
                        putInt("duration", durationSec)
                        putString("url", Uri.fromFile(file).toString())
                        putString("contentUri", "")
                        putString("filePath", file.absolutePath)
                        putString("artwork", "")
                        putDouble("size", file.length().toDouble())
                        putBoolean("isLocal", true)
                    }

                    results.pushMap(trackMap)
                }
            }
        }
    }
}
