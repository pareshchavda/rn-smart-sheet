package com.rnsmartsheet

import android.view.View
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.PixelUtil
import com.margelo.nitro.NitroModules
import com.margelo.nitro.com.rnsmartsheet.HybridSmartSheetHelperSpec
import com.google.android.material.bottomsheet.BottomSheetBehavior

class HybridSmartSheetHelper : HybridSmartSheetHelperSpec() {
    
    override fun snapToIndex(viewTag: Double, index: Double) {
        UiThreadUtil.runOnUiThread {
            val context = NitroModules.applicationContext
            val reactContext = context as? ReactContext
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManager(reactContext, UIManagerHelper.getSurfaceId(reactContext))
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                view?.post {
                    when (index.toInt()) {
                        -1 -> view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
                        0 -> view.behavior.state = BottomSheetBehavior.STATE_COLLAPSED
                        1 -> view.behavior.state = BottomSheetBehavior.STATE_HALF_EXPANDED
                        else -> view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
                    }
                    view.requestLayout()
                }
            }
        }
    }

    override fun snapToPosition(viewTag: Double, position: Double) {
        UiThreadUtil.runOnUiThread {
            val context = NitroModules.applicationContext
            val reactContext = context as? ReactContext
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManager(reactContext, UIManagerHelper.getSurfaceId(reactContext))
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                view?.post {
                    val pixelPosition = PixelUtil.toPixelFromDIP(position)
                    view.behavior.expandedOffset = (view.height - pixelPosition).toInt().coerceAtLeast(0)
                    view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
                }
            }
        }
    }

    override fun close(viewTag: Double) {
        UiThreadUtil.runOnUiThread {
            val context = NitroModules.applicationContext
            val reactContext = context as? ReactContext
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManager(reactContext, UIManagerHelper.getSurfaceId(reactContext))
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                view?.post {
                    view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
                    view.requestLayout()
                }
            }
        }
    }

    override fun forceClose(viewTag: Double) {
        UiThreadUtil.runOnUiThread {
            val context = NitroModules.applicationContext
            val reactContext = context as? ReactContext
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManager(reactContext, UIManagerHelper.getSurfaceId(reactContext))
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                view?.post {
                    view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
                    view.requestLayout()
                }
            }
        }
    }
}
