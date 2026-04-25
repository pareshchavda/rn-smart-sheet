package com.rnsmartsheet

import android.content.Context
import android.view.View
import android.util.Log
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsAnimationCompat
import androidx.core.view.WindowInsetsAnimationCompat.Callback.DISPATCH_MODE_STOP
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
        this.fitsSystemWindows = true

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

    private var stableHeight = 0

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (keyboardHeight == 0 && h > stableHeight) {
            stableHeight = h
            updateSnapPoints()
        }
    }

    private fun setupInsetsListener() {
        // Pure Native: Listen for window insets (keyboard, status bar, etc.)
        ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets ->
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            
            // Calculate pure keyboard height (ime - navigation bar)
            val newHeight = (imeInsets.bottom - systemBars.bottom).coerceAtLeast(0)
            
            if (keyboardHeight != newHeight) {
                keyboardHeight = newHeight
                handleKeyboardChange()
            }
            insets
        }

        // Add support for frame-by-frame keyboard animation sync (Android 11+)
        val callback = object : WindowInsetsAnimationCompat.Callback(DISPATCH_MODE_STOP) {
            override fun onProgress(
                insets: WindowInsetsCompat,
                runningAnimations: MutableList<WindowInsetsAnimationCompat>
            ): WindowInsetsCompat {
                val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
                val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
                val newKeyboardHeight = (imeInsets.bottom - systemBars.bottom).coerceAtLeast(0)
                
                if (keyboardHeight != newKeyboardHeight) {
                    keyboardHeight = newKeyboardHeight
                    // Real-time lift and resize during animation
                    applyKeyboardAdjustments()
                }
                return insets
            }
        }
        ViewCompat.setWindowInsetsAnimationCallback(this, callback)

        // Listen for focus changes in ANY child view (Native or React)
        this.viewTreeObserver.addOnGlobalFocusChangeListener { _, newFocus ->
            if (newFocus != null && isChildOf(newFocus, sheetContainer)) {
                Log.d("SmartSheetView", "Focus detected in sheet! Lifting...")
                if (behavior.state != BottomSheetBehavior.STATE_EXPANDED) {
                    behavior.state = BottomSheetBehavior.STATE_EXPANDED
                }
            }
        }
    }

    private fun isChildOf(view: View, parent: View): Boolean {
        var current: View? = view
        while (current != null) {
            if (current == parent) return true
            current = if (current.parent is View) current.parent as View else null
        }
        return false
    }

    private fun handleKeyboardChange() {
        applyKeyboardAdjustments()

        if (keyboardBehavior == "extend" && keyboardHeight > 0 && behavior.state != BottomSheetBehavior.STATE_HIDDEN) {
            behavior.state = BottomSheetBehavior.STATE_EXPANDED
        }
    }

    private fun applyKeyboardAdjustments() {
        // Use padding on the CoordinatorLayout to simulate adjustResize
        // This is safer and more stable in React Native than changing LayoutParams
        this.setPadding(0, 0, 0, keyboardHeight)

        // Ensure the internal container fills the visible area
        val innerParams = sheetContainer.layoutParams as LayoutParams
        if (innerParams.height != LayoutParams.MATCH_PARENT) {
            innerParams.height = LayoutParams.MATCH_PARENT
            sheetContainer.layoutParams = innerParams
        }

        // Re-trigger snap point calculation based on the VISIBLE area (total - padding)
        val visibleHeight = if (stableHeight > 0) stableHeight - keyboardHeight else height - keyboardHeight
        updateSnapPoints(visibleHeight.toFloat())
        
        if (keyboardBehavior == "extend" && keyboardHeight > 0 && behavior.state != BottomSheetBehavior.STATE_HIDDEN) {
            behavior.state = BottomSheetBehavior.STATE_EXPANDED
        }
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

    private fun updateSnapPoints(forcedHeight: Float = -1f) {
        val currentHeight = if (forcedHeight > 0) forcedHeight else height.toFloat()
        if (currentHeight <= 0) return

        if (snapPoints.isNotEmpty()) {
            val maxPoint = snapPoints.last().toInt()
            
            // We no longer manually set sheetContainer height here because it's MATCH_PARENT
            // and managed by parent padding.
            Log.d("SmartSheetView", "Snap point update: parentVisibleHeight=$currentHeight, maxPoint=$maxPoint")

            // Configure behavior based on snap points
            when (snapPoints.size) {
                1 -> {
                    behavior.peekHeight = snapPoints[0].toInt()
                    behavior.isFitToContents = false
                    behavior.expandedOffset = (currentHeight - snapPoints[0].toFloat()).toInt().coerceAtLeast(0)
                }
                2 -> {
                    behavior.peekHeight = snapPoints[0].toInt()
                    behavior.isFitToContents = false
                    behavior.expandedOffset = (currentHeight - snapPoints[1].toFloat()).toInt().coerceAtLeast(0)
                }
                else -> {
                    behavior.peekHeight = snapPoints[0].toInt()
                    behavior.isFitToContents = false
                    behavior.isHideable = true
                    
                    // Calculate ratio for the middle point
                    val midPoint = snapPoints[1].toFloat()
                    behavior.halfExpandedRatio = ((currentHeight - midPoint) / currentHeight).coerceIn(0f, 1f)
                    
                    // Offset for the highest point
                    val topOffset = (currentHeight - snapPoints.last().toFloat()).toInt()
                    behavior.expandedOffset = topOffset.coerceAtLeast(0)
                }
            }
        } else if (isDynamicSizingEnabled) {
            updateDynamicHeight()
        }
    }

    private fun updateDynamicHeight() {
        var contentHeight = 0
        for (i in 0 until sheetContainer.childCount) {
            contentHeight += sheetContainer.getChildAt(i).measuredHeight
        }
        
        if (contentHeight > 0) {
            val params = sheetContainer.layoutParams as LayoutParams
            if (params.height != LayoutParams.WRAP_CONTENT) {
                params.height = LayoutParams.WRAP_CONTENT
                sheetContainer.layoutParams = params
            }
            
            val totalNeeded = contentHeight + sheetContainer.paddingTop + sheetContainer.paddingBottom
            behavior.peekHeight = totalNeeded.coerceAtMost(height)
            behavior.isFitToContents = true
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
