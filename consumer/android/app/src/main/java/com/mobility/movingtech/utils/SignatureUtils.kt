package com.mobility.movingtech.utils

import com.facebook.react.bridge.ReactContext
import org.bouncycastle.openssl.PEMKeyPair
import org.bouncycastle.openssl.PEMParser
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter
import org.bouncycastle.util.encoders.Base64
import org.json.JSONObject
import java.io.IOException
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.security.KeyFactory
import java.security.KeyPair
import java.security.PrivateKey
import java.security.Signature
import java.security.spec.PKCS8EncodedKeySpec


object SignatureUtil {

    fun createSignature(payload: JSONObject, filePath: String, context: ReactContext): String {
        try {
            val privateKey = readPrivateKeyFromResources(filePath, context)
            val privateSignature = Signature.getInstance("SHA256withRSA")
            val requiredFields =
                arrayOf("mobileNumber", "mobileCountryCode", "merchantId", "timestamp")
            for (key in requiredFields) if (!payload.has(key)) throw Exception(
                "$key not found in payload"
            )
            val signatureAuthData = payload.toString()
            privateSignature.initSign(privateKey)
            privateSignature.update(signatureAuthData.toByteArray(StandardCharsets.UTF_8))
            val signature = privateSignature.sign()
            val encodedSignature = String(Base64.encode(signature))
            return encodedSignature
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return ""
    }

    @Throws(IOException::class)
    private fun readPrivateKeyFromResources(fileName: String, context: ReactContext): PrivateKey {
        val resourceStream = context.assets.open(fileName)
        val reader = InputStreamReader(resourceStream)
        val pemParser = PEMParser(reader)

        val pemObject = pemParser.readObject()
        pemParser.close()

        return when (pemObject) {
            is PEMKeyPair -> {
                val keyPair: KeyPair = JcaPEMKeyConverter().getKeyPair(pemObject)
                keyPair.private
            }
            is org.bouncycastle.asn1.pkcs.PrivateKeyInfo -> {
                val keyFactory = KeyFactory.getInstance("RSA")
                val keySpec = PKCS8EncodedKeySpec(pemObject.encoded)
                keyFactory.generatePrivate(keySpec)
            }
            else -> throw IllegalArgumentException("Invalid key format")
        }
    }

}