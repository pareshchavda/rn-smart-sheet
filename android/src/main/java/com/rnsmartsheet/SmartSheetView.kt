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
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.google.android.material.bottomsheet.BottomSheetBehavior

class SmartSheetView(context: Context) : CoordinatorLayout(context) {

    private val sheetContainer: FrameLayout = FrameLayout(context)
    val behavior: BottomSheetBehavior<FrameLayout> = BottomSheetBehavior()
    
    private var isDynamicSizingEnabled = false
    private var keyboardBehavior = "interactive"
    private var keyboardHeight = 0
    private var snapPoints: List<Double> = emptyList()
    private var lastIndex = -1

    init {
        // Configure the container
        val params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
        params.behavior = behavior
        
        behavior.isHideable = true
        behavior.skipCollapsed = false
        behavior.state = BottomSheetBehavior.STATE_HIDDEN
        
        sheetContainer.layoutParams = params
        sheetContainer.setBackgroundColor(Color.TRANSPARENT)
        
        // Transparent background for the coordinator to avoid blocking background
        this.setBackgroundColor(Color.TRANSPARENT)
        this.clipChildren = false
        this.clipToPadding = false

        super.addView(sheetContainer, -1, params)

        setupBehaviorListeners()
        setupInsetsListener()
        setupLayoutListeners()
        setupTouchHandling()
    }

    private fun setupTouchHandling() {
        this.setOnTouchListener { _, _ ->
            // If the sheet is open, we can handle backdrop clicks here if needed
            false
        }
    }

    private fun setupBehaviorListeners() {
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
                    // Notify about animation start/end
                    emitEvent("topSheetAnimate", Arguments.createMap().apply {
                        putInt("fromIndex", lastIndex)
                        putInt("toIndex", index)
                    })
                    
                    // Notify about final state change
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

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val displayMetrics = context.resources.displayMetrics
        val stableHeightSpec = MeasureSpec.makeMeasureSpec(displayMetrics.heightPixels, MeasureSpec.EXACTLY)
        super.onMeasure(widthMeasureSpec, stableHeightSpec)
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        val displayMetrics = context.resources.displayMetrics
        // Force the bottom to the screen edge regardless of what the parent says
        super.onLayout(changed, l, t, r, displayMetrics.heightPixels)
    }

    private fun setupInsetsListener() {
        ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets ->
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            
            // Subtract system bars (like navigation bar) to get pure keyboard height
            val newKeyboardHeight = (imeInsets.bottom - systemBars.bottom).coerceAtLeast(0)
            
            if (keyboardHeight != newKeyboardHeight) {
                keyboardHeight = newKeyboardHeight
                Log.d("SmartSheetView", "Keyboard height: $keyboardHeight")
                handleKeyboardChange()
            }
            insets
        }
    }

    private fun handleKeyboardChange() {
        // Lift the container content
        sheetContainer.updatePadding(bottom = keyboardHeight)
        
        if (keyboardBehavior == "extend" && keyboardHeight > 0 && behavior.state != BottomSheetBehavior.STATE_HIDDEN) {
            behavior.state = BottomSheetBehavior.STATE_EXPANDED
        }
        
        // Force a layout refresh with the new padding
        sheetContainer.requestLayout()
        this.requestLayout()
    }

    private fun setupLayoutListeners() {
        this.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            updateSnapPoints()
        }
        
        sheetContainer.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            if (isDynamicSizingEnabled) {
                updateDynamicHeight()
            }
        }
    }

    private fun updateSnapPoints() {
        if (snapPoints.isEmpty() || height == 0) return

        val maxPoint = snapPoints.last().toInt()
        val totalHeight = height.toFloat()
        
        // Update container height
        val params = sheetContainer.layoutParams as LayoutParams
        if (params.height != maxPoint && maxPoint > 0) {
            params.height = maxPoint
            sheetContainer.layoutParams = params
        }

        // Configure behavior based on snap points
        when (snapPoints.size) {
            1 -> {
                behavior.peekHeight = snapPoints[0].toInt()
                behavior.isFitToContents = true
            }
            2 -> {
                behavior.peekHeight = snapPoints[0].toInt()
                behavior.isFitToContents = true
            }
            else -> {
                behavior.peekHeight = snapPoints[0].toInt()
                behavior.isFitToContents = false
                behavior.isHideable = true
                
                // Calculate ratio for the middle point
                val midPoint = snapPoints[1].toFloat()
                behavior.halfExpandedRatio = (totalHeight - midPoint) / totalHeight
                
                // Offset for the highest point
                val topOffset = (totalHeight - snapPoints.last().toFloat()).toInt()
                behavior.expandedOffset = topOffset.coerceAtLeast(0)
            }
        }
    }

    private fun updateDynamicHeight() {
        var contentHeight = 0
        for (i in 0 until sheetContainer.childCount) {
            contentHeight += sheetContainer.getChildAt(i).measuredHeight
        }
        
        if (contentHeight > 0) {
            val totalNeeded = contentHeight + sheetContainer.paddingTop + sheetContainer.paddingBottom
            behavior.peekHeight = totalNeeded
        }
    }

    fun setSnapPoints(points: List<Double>) {
        this.snapPoints = points
        updateSnapPoints()
    }

    fun setEnableDynamicSizing(enabled: Boolean) {
        this.isDynamicSizingEnabled = enabled
    }

    fun setKeyboardBehavior(behavior: String) {
        this.keyboardBehavior = behavior
    }

    private class SmartSheetEvent(
        surfaceId: Int,
        viewId: Int,
        private val mEventName: String,
        private val eventData: WritableMap
    ) : Event<SmartSheetEvent>(surfaceId, viewId) {
        override fun getEventName() = mEventName
        override fun getEventData(): WritableMap? = eventData
        override fun dispatch(rctEventEmitter: RCTEventEmitter) {
            rctEventEmitter.receiveEvent(viewTag, eventName, eventData)
        }
    }

    private fun emitEvent(name: String, eventData: WritableMap) {
        try {
            val reactContext = context as? ReactContext ?: return
            val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
            val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
            
            eventDispatcher?.dispatchEvent(SmartSheetEvent(surfaceId, id, name, eventData))
        } catch (e: Exception) {
            Log.e("SmartSheetView", "Error emitting event $name", e)
        }
    }

    override fun addView(child: View, index: Int, params: android.view.ViewGroup.LayoutParams) {
        if (child === sheetContainer) {
            super.addView(child, index, params)
        } else {
            sheetContainer.addView(child, index, params)
        }
    }
}
