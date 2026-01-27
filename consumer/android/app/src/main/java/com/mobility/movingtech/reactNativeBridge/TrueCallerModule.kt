package com.mobility.movingtech.reactNativeBridge

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.mobility.movingtech.R
import com.mobility.movingtech.Utils
import com.mobility.movingtech.utils.SignatureUtil.createSignature
import com.truecaller.android.sdk.oAuth.CodeVerifierUtil
import com.truecaller.android.sdk.oAuth.TcOAuthCallback
import com.truecaller.android.sdk.oAuth.TcOAuthData
import com.truecaller.android.sdk.oAuth.TcOAuthError
import com.truecaller.android.sdk.oAuth.TcSdk
import com.truecaller.android.sdk.oAuth.TcSdkOptions
import okhttp3.Call
import okhttp3.Callback
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okio.IOException
import org.json.JSONObject
import java.math.BigInteger
import java.security.SecureRandom

class TrueCallerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    private var reactTrueCallerContext : ReactApplicationContext = reactContext;
    private var TAG : String = "TrueCallerModule"

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "TrueCallerModule"
    }

    @ReactMethod
    public fun initTrueCallerSDK(promise: Promise) {
        try {
            val codeVerifier = CodeVerifierUtil.generateRandomCodeVerifier();
            val tcOAuthCallback: TcOAuthCallback = object : TcOAuthCallback {
                override fun onSuccess(tcOAuthData: TcOAuthData) {
                    Log.d(TAG, "initTrueCallerSDK onSuccess $tcOAuthData");
                    getAccessToken(tcOAuthData.authorizationCode, codeVerifier, promise);
                }

                override fun onVerificationRequired(tcOAuthError: TcOAuthError?) {
                    Log.e(TAG, "initTrueCallerSDK onVerificationRequired $tcOAuthError");
                }

                override fun onFailure(tcOAuthError: TcOAuthError) {
                    Log.e(TAG, "initTrueCallerSDK onFailure $tcOAuthError");
                    promise.reject("TC_AUTH_FAILED", "TrueCaller SDK oAuth Failed")
                }
            }

            val tcSdkOptions = TcSdkOptions.Builder(reactTrueCallerContext, tcOAuthCallback).build()
            TcSdk.init(tcSdkOptions)

            val isUsable = TcSdk.getInstance().isOAuthFlowUsable;
            if (!isUsable) {
                Log.e(TAG, "True caller not found");
                promise.reject("TRUE_CALLER_NOT_FOUND", "True caller not found");
            }

            val stateRequested = BigInteger(130, SecureRandom()).toString(32)
            TcSdk.getInstance().setOAuthState(stateRequested);

            TcSdk.getInstance().setOAuthScopes(arrayOf("profile", "phone", "email", "openid"))


            val codeChallenge = CodeVerifierUtil.getCodeChallenge(codeVerifier)

            if (codeChallenge == null) {
                Log.e(TAG, "Code challenge is Null.Can’t proceed further");
                promise.reject(
                    "CODE_CHALLENGE_NULL",
                    "Code challenge is Null.Can’t proceed further"
                )
                return
            }

            TcSdk.getInstance().setCodeChallenge(codeChallenge)

            val activity = reactTrueCallerContext.currentActivity as FragmentActivity;

            TcSdk.getInstance().getAuthorizationCode(activity);
        }catch (e : Exception){
            promise.reject("TRUE_CALLER_UNKNOWN_ERROR", "True caller failed!");
            Log.e(TAG, "Something went wrong! $e");
        }
    }


    private fun getAccessToken(authorizationCode: String, codeVerifier: String, promise: Promise) {
        val clientId = reactTrueCallerContext.getString(R.string.truecaller_client_id);
        val client = OkHttpClient()

        val requestBody = FormBody.Builder()
            .add("grant_type", "authorization_code")
            .add("client_id", clientId)
            .add("code", authorizationCode)
            .add("code_verifier", codeVerifier)
            .build()

        val request = Request.Builder()
            .url("https://oauth-account-noneu.truecaller.com/v1/token")
            .addHeader("Content-Type", "application/x-www-form-urlencoded")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Access token API failed $e");
                promise.reject("ACCESS_TOKEN_FAILED", "Access token API failed");
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (it.isSuccessful) {
                        val responseData = it.body?.string()
                        if(responseData!=null) {
                            try{
                                val jsonObject = JSONObject(responseData)
                                val accessToken = jsonObject.getString("access_token");
                                getUserProfile(accessToken, promise);
                                Log.d(TAG, "getAccessToken Response: ${responseData.toString()}")
                            }catch (e : Exception){
                                Log.e(TAG, "Failed to get access_token from body $e");
                                promise.reject("ACCESS_TOKEN_PARSE_ERR", "Failed to get access_token from body");
                            }
                        }
                    } else {
                        Log.e(TAG, "getAccessToken Error: ${it.code}")
                        promise.reject("ACCESS_TOKEN_FAILED", "Access token API failed with code ${it.code} ${it.body}");
                    }
                }
            }
        })
    }

    private fun getUserProfile(bearerToken : String, promise: Promise) {
        val client = OkHttpClient();
        val request = Request.Builder()
            .url("https://oauth-account-noneu.truecaller.com/v1/userinfo")
            .addHeader("Authorization", "Bearer $bearerToken")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                promise.reject("TC_USER_PROFILE_ERR", "TrueCaller profile api failed")
                Log.e(TAG, "TrueCaller profile api failed $e");
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (it.isSuccessful) {
                        val responseData = it.body?.string()
                        if (!responseData.isNullOrEmpty()) {
                            try {
                                val jsonResp = JSONObject(responseData)
                                promise.resolve(Utils.convertJsonToMap(jsonResp))
                            } catch (e: Exception) {
                                Log.e(TAG, "Failed to parse response ${e}");
                                promise.reject("TC_USER_PROFILE_PARSE_ERR", "Failed to parse response", e)
                            }
                        } else {
                            Log.e(TAG, "Empty response from server");
                            promise.reject("TC_USER_PROFILE_EMPTY", "Empty response from server")
                        }
                    } else {
                        Log.e(TAG, "API failed with code ${it.code}");
                        promise.reject("TC_USER_PROFILE_ERR", "API failed with code ${it.code}")
                    }
                }
            }
        })
    }

    @ReactMethod
    public fun getSignature(payload: String, promise: Promise){
        val jsonPayload = JSONObject(payload);
        val filePath = "private-key.pem"

        val map: WritableMap = WritableNativeMap()
        map.putString("signature", createSignature(jsonPayload, filePath, reactTrueCallerContext));

        promise.resolve(map);
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == TcSdk.SHARE_PROFILE_REQUEST_CODE) {
            try {
                TcSdk.getInstance().onActivityResultObtained(
                    activity as FragmentActivity,
                    requestCode,
                    resultCode,
                    data
                )
            } catch (e: Exception) {
                Log.e(TAG, "TcSdk not initialized, skipping result handling. ${e}")
                FirebaseCrashlytics.getInstance().recordException(e)
            }
        }
    }

    override fun onNewIntent(p0: Intent?) {
    }
}
