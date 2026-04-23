package com.rnsmartsheet

import android.content.Context
import android.view.View
import android.util.Log
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import android.graphics.Color
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.PixelUtil
import com.google.android.material.bottomsheet.BottomSheetBehavior

class SmartSheetView(context: Context) : CoordinatorLayout(context) {

    private val sheetContainer: FrameLayout = FrameLayout(context)
    val behavior: BottomSheetBehavior<FrameLayout> = BottomSheetBehavior()
    
    private var isDynamicSizingEnabled = false
    private var keyboardBehavior = "interactive"
    private var keyboardHeight = 0
    private var snapPoints: List<Double> = emptyList()

    init {
        val params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
        params.behavior = behavior
        
        behavior.isHideable = true
        behavior.skipCollapsed = false // Allow collapsed state
        behavior.state = BottomSheetBehavior.STATE_HIDDEN
        sheetContainer.layoutParams = params
        
        // Important: Set background to transparent to avoid black screen
        this.setBackgroundColor(Color.TRANSPARENT)
        sheetContainer.setBackgroundColor(Color.TRANSPARENT)

        super.addView(sheetContainer, -1, params)

        setupBehaviorListeners()
        setupInsetsListener()
        setupLayoutListener()
        setupTouchListener()
    }

    private fun setupTouchListener() {
        this.setOnTouchListener { _, event ->
            if (event.action == android.view.MotionEvent.ACTION_DOWN) {
                if (behavior.state != BottomSheetBehavior.STATE_HIDDEN) {
                    // Check if touch is outside the sheet container
                    val location = IntArray(2)
                    sheetContainer.getLocationOnScreen(location)
                    val sheetX = location[0]
                    val sheetY = location[1]
                    val sheetWidth = sheetContainer.width
                    val sheetHeight = sheetContainer.height

                    if (event.rawX < sheetX || event.rawX > sheetX + sheetWidth ||
                        event.rawY < sheetY || event.rawY > sheetY + sheetHeight) {
                        
                        // Click is outside the sheet, close it
                        behavior.state = BottomSheetBehavior.STATE_HIDDEN
                        return@setOnTouchListener true
                    }
                }
            }
            false
        }
    }

    private fun setupBehaviorListeners() {
        var lastIndex = -1
        behavior.addBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {
                Log.d("SmartSheetView", "onStateChanged: $newState")
                val index = when (newState) {
                    BottomSheetBehavior.STATE_EXPANDED -> if (snapPoints.size >= 3) 2 else if (snapPoints.size == 2) 1 else 0
                    BottomSheetBehavior.STATE_HALF_EXPANDED -> 1
                    BottomSheetBehavior.STATE_COLLAPSED -> 0
                    BottomSheetBehavior.STATE_HIDDEN -> -1
                    else -> -2
                }

                if (index != -2 && index != lastIndex) {
                    // Emit animate event
                    emitEvent("topSheetAnimate", Arguments.createMap().apply {
                        putInt("fromIndex", lastIndex)
                        putInt("toIndex", index)
                    })
                    
                    emitEvent("topSheetChange", Arguments.createMap().apply {
                        putInt("index", index)
                        putDouble("position", PixelUtil.toDIPFromPixel(bottomSheet.top.toFloat()).toDouble())
                    })
                    lastIndex = index
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {
                emitEvent("topSheetPositionChange", Arguments.createMap().apply {
                    putDouble("position", PixelUtil.toDIPFromPixel(bottomSheet.top.toFloat()).toDouble())
                })
            }
        })
    }

    private fun setupInsetsListener() {
        ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets ->
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
            keyboardHeight = imeInsets.bottom
            
            handleKeyboardChange()
            insets
        }
    }

    private fun setupLayoutListener() {
        this.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            updateSnapPoints()
        }
        sheetContainer.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            if (isDynamicSizingEnabled) {
                updateDynamicHeight()
            }
        }
    }

    private fun handleKeyboardChange() {
        when (keyboardBehavior) {
            "interactive" -> {
                sheetContainer.updatePadding(bottom = keyboardHeight)
            }
            "extend" -> {
                if (keyboardHeight > 0 && behavior.state != BottomSheetBehavior.STATE_EXPANDED) {
                    behavior.state = BottomSheetBehavior.STATE_EXPANDED
                }
            }
        }
    }

    private fun updateDynamicHeight() {
        var totalHeight = 0
        for (i in 0 until sheetContainer.childCount) {
            totalHeight += sheetContainer.getChildAt(i).measuredHeight
        }
        
        if (totalHeight > 0) {
            val padding = sheetContainer.paddingTop + sheetContainer.paddingBottom
            behavior.peekHeight = totalHeight + padding
        }
    }

    fun setEnableDynamicSizing(enabled: Boolean) {
        this.isDynamicSizingEnabled = enabled
        if (enabled) {
            behavior.peekHeight = BottomSheetBehavior.PEEK_HEIGHT_AUTO
            updateDynamicHeight()
        }
    }

    fun setKeyboardBehavior(behavior: String?) {
        this.keyboardBehavior = behavior ?: "interactive"
    }

    fun setSnapPoints(points: List<Double>) {
        this.snapPoints = points
        updateSnapPoints()
    }

    private fun updateSnapPoints() {
        if (snapPoints.isEmpty()) return

        // Configure behavior based on number of snap points
        when (snapPoints.size) {
            1 -> {
                behavior.peekHeight = snapPoints[0].toInt()
                behavior.isFitToContents = true
            }
            2 -> {
                behavior.peekHeight = snapPoints[0].toInt()
                behavior.isFitToContents = true
                // Expanded will be the second point implicitly
            }
            else -> {
                // 3 or more points
                behavior.peekHeight = snapPoints[0].toInt()
                behavior.isFitToContents = true
                
                // Use half-expanded for the middle point
                behavior.isHideable = true
                val totalHeight = this.height.toFloat()
                if (totalHeight > 0) {
                    behavior.halfExpandedRatio = (totalHeight - snapPoints[1].toFloat()) / totalHeight
                }
            }
        }
    }

    private fun emitEvent(name: String, event: com.facebook.react.bridge.WritableMap) {
        (context as? ReactContext)?.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(id, name, event)
    }

    override fun addView(child: View, index: Int, params: android.view.ViewGroup.LayoutParams) {
        if (child === sheetContainer) {
            super.addView(child, index, params)
        } else {
            // Redirect children to the sheet container
            sheetContainer.addView(child, index, params)
            sheetContainer.requestLayout()
            this.requestLayout()
        }
    }

    // Do NOT override getChildDiff, getChildAt, etc. as it confuses React Native
}
