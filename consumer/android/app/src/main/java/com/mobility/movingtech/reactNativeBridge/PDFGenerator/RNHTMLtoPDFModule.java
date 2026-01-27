package com.mobility.movingtech.reactNativeBridge.PDFGenerator;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.print.PdfConverter;
import android.print.PrintAttributes;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.FileProvider;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.util.UUID;

public class RNHTMLtoPDFModule extends ReactContextBaseJavaModule {

    private static final String HTML = "html";
    private static final String FILE_NAME = "fileName";
    private static final String DIRECTORY = "directory";
    private static final String BASE_64 = "base64";
    private static final String BASE_URL = "baseURL";
    private static final String HEIGHT = "height";
    private static final String WIDTH = "width";

    private static final String PDF_EXTENSION = ".pdf";
    private static final String PDF_PREFIX = "PDF_";

    private final ReactApplicationContext mReactContext;

    public RNHTMLtoPDFModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNHTMLtoPDF";
    }

    @ReactMethod
    public void convert(final ReadableMap options, final Promise promise) {
        try {
            String htmlString = options.hasKey(HTML) ? options.getString(HTML) : null;
            if (htmlString == null) {
                promise.reject(new Exception("RNHTMLtoPDF error: Invalid htmlString parameter."));
                return;
            }

            String fileName;
            if (options.hasKey(FILE_NAME)) {
                fileName = options.getString(FILE_NAME);
                if (!isFileNameValid(fileName)) {
                    promise.reject(new Exception("RNHTMLtoPDF error: Invalid fileName parameter."));
                    return;
                }
            } else {
                fileName = PDF_PREFIX + UUID.randomUUID().toString();
            }

            File destinationFile = getFile(fileName, promise);
            if (destinationFile == null) {
                promise.reject(new Exception("RNHTMLtoPDF error: Unable to create file."));
                return;
            }

            PrintAttributes pagesize = null;
            if (options.hasKey(HEIGHT) && options.hasKey(WIDTH)) {
                int width = options.getInt(WIDTH);
                int height = options.getInt(HEIGHT);
                pagesize = new PrintAttributes.Builder()
                        .setMediaSize(new PrintAttributes.MediaSize("custom", "CUSTOM",
                                (int) (width * 1000 / 72.0),
                                (int) (height * 1000 / 72.0))
                        )
                        .setResolution(new PrintAttributes.Resolution("RESOLUTION_ID", "RESOLUTION_ID", 600, 600))
                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                        .build();
            }
            
            WritableMap resultMap = Arguments.createMap();
            resultMap.putString("filePath", destinationFile.getAbsolutePath());

            boolean base64 = options.hasKey(BASE_64) && options.getBoolean(BASE_64);
            
            convertToPDF(htmlString, destinationFile, base64,
                    resultMap, promise, options.hasKey(BASE_URL) ? options.getString(BASE_URL) : null, pagesize);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private void convertToPDF(String htmlString, File file, boolean shouldEncode,
                              WritableMap resultMap, Promise promise, @Nullable String baseURL,
                              @Nullable PrintAttributes printAttributes) throws Exception {
        PdfConverter pdfConverter = PdfConverter.getInstance();
        if (printAttributes != null) {
            pdfConverter.setPdfPrintAttrs(printAttributes);
        }
        pdfConverter.convert(mReactContext, htmlString, file, shouldEncode, resultMap, promise, baseURL);
        
        openPDFViewer(file);
    }

    private void openPDFViewer(File file) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri uri = FileProvider.getUriForFile(mReactContext, mReactContext.getPackageName() + ".rnshare.fileprovider", file);
            
            intent.setDataAndType(uri, "application/pdf");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Intent chooser = Intent.createChooser(intent, "Open Invoice");
            chooser.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            mReactContext.startActivity(chooser);
        } catch (Exception e) {
            android.util.Log.e("RNHTMLtoPDF", "Error opening PDF viewer: " + e.getMessage(), e);
        }
    }

    private void internalSendNotification(File file, String title, String description) {
        String channelId = "pdf_download_channel";
        String channelName = "PDF Download Notifications";
        NotificationManager notificationManager = (NotificationManager) mReactContext.getSystemService(ReactApplicationContext.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH);
            notificationManager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(Intent.ACTION_VIEW);
        Uri uri = FileProvider.getUriForFile(mReactContext, mReactContext.getPackageName() + ".rnshare.fileprovider", file);
        intent.setDataAndType(uri, "application/pdf");
        intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        PendingIntent pendingIntent = PendingIntent.getActivity(mReactContext, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(mReactContext, channelId)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setContentTitle(title)
                .setContentText(description)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        notificationManager.notify(1, builder.build());
    }

    @ReactMethod
    public void sendNotification(ReadableMap options, Promise promise) {
        try {
            String filePath = options.getString("file");
            String title = options.getString("title");
            String description = options.getString("description");
            if (filePath == null || title == null || description == null) {
                promise.reject(new Exception("All Parameters are required"));
                return;
            }
            File file = new File(filePath);
            if (!file.exists()) {
                promise.reject(new Exception("File does not exist"));
                return;
            }
            internalSendNotification(file, title, description);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private File getFile(String fileName, Promise promise) {
        try {
            File cacheDir = mReactContext.getCacheDir();
            File file = new File(cacheDir, fileName + PDF_EXTENSION); 
            return file;
        } catch (Exception e) {
            promise.reject(e);
            return null;
        }
    }

    private boolean isFileNameValid(String fileName) throws Exception {
        return new File(fileName).getCanonicalFile().getName().equals(fileName);
    }
}
