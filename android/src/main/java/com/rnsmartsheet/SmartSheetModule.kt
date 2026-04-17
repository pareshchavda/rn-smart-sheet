package com.rnsmartsheet

import com.facebook.react.bridge.ReactApplicationContext

class SmartSheetModule(reactContext: ReactApplicationContext) : NativeSmartSheetModuleSpec(reactContext) {
    companion object {
        const val NAME = "RNSmartSheetModule"
    }

    override fun getName(): String {
        return NAME
    }

    override fun isFabricAvailable(): Boolean {
        return true
    }
}
