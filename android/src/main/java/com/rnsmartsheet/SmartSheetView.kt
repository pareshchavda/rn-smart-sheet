package com.rnsmartsheet

import android.content.Context
import android.view.View
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.material.bottomsheet.BottomSheetBehavior

class SmartSheetView(context: Context) : CoordinatorLayout(context) {

    private val sheetContainer: FrameLayout = FrameLayout(context)
    val behavior: BottomSheetBehavior<FrameLayout> = BottomSheetBehavior()

    init {
        val params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        params.behavior = behavior
        
        behavior.state = BottomSheetBehavior.STATE_HIDDEN
        sheetContainer.layoutParams = params
        super.addView(sheetContainer, -1, params)

        setupBehaviorListeners()
    }

    private fun setupBehaviorListeners() {
        behavior.addBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {
                var index = -1
                when (newState) {
                    BottomSheetBehavior.STATE_EXPANDED -> index = 1
                    BottomSheetBehavior.STATE_COLLAPSED -> index = 0
                    BottomSheetBehavior.STATE_HIDDEN -> index = -1
                }

                if (index != -1 || newState == BottomSheetBehavior.STATE_HIDDEN) {
                    val event = Arguments.createMap().apply {
                        putInt("index", index)
                        putDouble("position", bottomSheet.top.toDouble())
                    }
                    val reactContext = context as ReactContext
                    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
                        id,
                        "topSheetChange",
                        event
                    )
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {
                val event = Arguments.createMap().apply {
                    putDouble("position", bottomSheet.top.toDouble())
                }
                val reactContext = context as ReactContext
                reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
                    id,
                    "topSheetPositionChange",
                    event
                )
            }
        })
    }

    override fun addView(child: View, index: Int, params: android.view.ViewGroup.LayoutParams) {
        if (child === sheetContainer) {
            super.addView(child, index, params)
        } else {
            sheetContainer.addView(child, index, params)
        }
    }

    override fun removeViewAt(index: Int) {
        if (sheetContainer.childCount > index) {
            sheetContainer.removeViewAt(index)
        }
    }

    override fun getChildCount(): Int {
        return sheetContainer.childCount
    }

    override fun getChildAt(index: Int): View? {
        return sheetContainer.getChildAt(index)
    }
}
