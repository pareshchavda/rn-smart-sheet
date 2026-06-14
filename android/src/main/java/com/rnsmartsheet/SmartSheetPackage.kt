package com.rnsmartsheet

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.com.rnsmartsheet.RNSmartSheetOnLoad

import java.lang.ref.WeakReference

class SmartSheetPackage : TurboReactPackage() {
    companion object {
        private var reactContextRef = WeakReference<ReactApplicationContext>(null)
        
        val reactContext: ReactApplicationContext?
            get() = reactContextRef.get()
            
        private fun setContext(context: ReactApplicationContext) {
            reactContextRef = WeakReference(context)
        }
    }

    init {
        RNSmartSheetOnLoad.initializeNative()
    }

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        setContext(reactContext)
        return if (name == SmartSheetModule.NAME) {
            SmartSheetModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos = mutableMapOf<String, ReactModuleInfo>()
            moduleInfos[SmartSheetModule.NAME] = ReactModuleInfo(
                SmartSheetModule.NAME,
                SmartSheetModule.NAME,
                false, // canOverrideExistingModule
                false, // needsEagerInit
                true,  // hasConstants
                false, // isCxxModule
                true   // isTurboModule
            )
            moduleInfos
        }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        setContext(reactContext)
        return listOf(SmartSheetViewManager())
    }
}
