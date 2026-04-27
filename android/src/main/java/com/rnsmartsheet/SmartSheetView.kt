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
    val behavior: BottomSheetBehavior<FrameLayout> = BottomSheetBehavior<FrameLayout>()
    
    private var isDynamicSizingEnabled = false
    private var keyboardBehavior = "interactive"
    private var keyboardHeight = 0
    private var snapPoints: List<Double> = emptyList()
    private var lastIndex = -1
    private var stableHeight = 0
    private var isInteracting = false

    init {
        // Setup the container with the BottomSheetBehavior
        val params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        params.behavior = behavior
        
        behavior.isHideable = true
        behavior.skipCollapsed = false
        behavior.state = BottomSheetBehavior.STATE_HIDDEN
        
        sheetContainer.layoutParams = params
        sheetContainer.setBackgroundColor(Color.TRANSPARENT)
        
        this.addView(sheetContainer)
        
        this.setBackgroundColor(Color.TRANSPARENT)
        this.clipChildren = false
        this.clipToPadding = false
        this.fitsSystemWindows = false // Manual handling is more reliable in RN

        setupBehaviorListeners()
        setupInsetsListener()
        setupLayoutListeners()
    }

    override fun dispatchTouchEvent(ev: android.view.MotionEvent): Boolean {
        when (ev.actionMasked) {
            android.view.MotionEvent.ACTION_DOWN -> isInteracting = true
            android.view.MotionEvent.ACTION_UP, android.view.MotionEvent.ACTION_CANCEL -> isInteracting = false
        }
        return super.dispatchTouchEvent(ev)
    }

    private var initialY = 0f
    override fun onInterceptTouchEvent(ev: android.view.MotionEvent): Boolean {
        if (!behavior.isDraggable) return super.onInterceptTouchEvent(ev)

        when (ev.actionMasked) {
            android.view.MotionEvent.ACTION_DOWN -> initialY = ev.rawY
            android.view.MotionEvent.ACTION_MOVE -> {
                val deltaY = ev.rawY - initialY
                if (deltaY > 0) { // Pulling down
                    // Check if we have a scrollable child and if it's NOT at the top
                    val scrollableChild = findScrollableChildUnder(ev.x, ev.y)
                    if (scrollableChild != null && scrollableChild.canScrollVertically(-1)) {
                        // The list is scrolled, so let it handle the pull down
                        return false 
                    }
                }
            }
        }
        return super.onInterceptTouchEvent(ev)
    }

    private fun findScrollableChildUnder(x: Float, y: Float): View? {
        return findScrollableChildRecursive(sheetContainer, x, y)
    }

    private fun findScrollableChildRecursive(view: View, x: Float, y: Float): View? {
        if (view is ViewGroup) {
            for (i in view.childCount - 1 downTo 0) {
                val child = view.getChildAt(i)
                if (child.visibility != View.VISIBLE) continue
                
                val location = IntArray(2)
                child.getLocationOnScreen(location)
                if (x >= location[0] && x <= location[0] + child.width &&
                    y >= location[1] && y <= location[1] + child.height) {
                    
                    val result = findScrollableChildRecursive(child, x, y)
                    if (result != null) return result
                }
            }
        }
        if (view.canScrollVertically(1) || view.canScrollVertically(-1)) {
            return view
        }
        return null
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
                
                // Only adjust if the change is significant to avoid jitter
                if (Math.abs(keyboardHeight - newKeyboardHeight) > 2) {
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
        // PRODUCTION FIX: Use actual height resizing instead of padding.
        // This forces BottomSheetBehavior to see the reduced workspace.
        val totalHeight = if (stableHeight > 0) stableHeight else height + paddingBottom
        val targetHeight = totalHeight - keyboardHeight
        
        if (this.layoutParams.height != targetHeight) {
            this.layoutParams.height = targetHeight
            this.requestLayout()
        }

        // Reset padding as we are using height now
        if (this.paddingBottom != 0) {
            this.setPadding(0, 0, 0, 0)
        }

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
            if (behavior.state != BottomSheetBehavior.STATE_EXPANDED) {
                behavior.state = BottomSheetBehavior.STATE_EXPANDED
            }
        }
    }

    private fun setupLayoutListeners() {
        this.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            // Only update if not interacting to avoid flicker during touch
            if (!isInteracting) {
                updateSnapPoints()
            }
        }
        
        sheetContainer.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            if (isDynamicSizingEnabled) {
                updateDynamicHeight()
            }
        }
    }

    private fun updateSnapPoints(forcedHeight: Float = -1f) {
        val visibleHeight = height - paddingBottom
        val currentHeight = if (forcedHeight > 0) forcedHeight else visibleHeight.toFloat()
        if (currentHeight <= 0) return

        if (snapPoints.isNotEmpty()) {
            val maxPoint = snapPoints.last().toInt()
            
            // We no longer manually set sheetContainer height here because it's MATCH_PARENT
            // and managed by parent padding.
            Log.d("SmartSheetView", "Snap point update: parentVisibleHeight=$currentHeight, maxPoint=$maxPoint")

            // Configure behavior based on snap points
            when (snapPoints.size) {
                1 -> {
                    val peekHeight = snapPoints[0].toInt()
                    if (behavior.peekHeight != peekHeight) {
                        behavior.peekHeight = peekHeight
                    }
                    if (behavior.isFitToContents) {
                        behavior.isFitToContents = false
                    }
                    val expandedOffset = (currentHeight - snapPoints[0].toFloat()).toInt().coerceAtLeast(0)
                    if (behavior.expandedOffset != expandedOffset) {
                        behavior.expandedOffset = expandedOffset
                    }
                }
                2 -> {
                    val peekHeight = snapPoints[0].toInt()
                    if (behavior.peekHeight != peekHeight) {
                        behavior.peekHeight = peekHeight
                    }
                    if (behavior.isFitToContents) {
                        behavior.isFitToContents = false
                    }
                    val expandedOffset = (currentHeight - snapPoints[1].toFloat()).toInt().coerceAtLeast(0)
                    if (behavior.expandedOffset != expandedOffset) {
                        behavior.expandedOffset = expandedOffset
                    }
                }
                else -> {
                    val peekHeight = snapPoints[0].toInt()
                    if (behavior.peekHeight != peekHeight) {
                        behavior.peekHeight = peekHeight
                    }
                    if (behavior.isFitToContents) {
                        behavior.isFitToContents = false
                    }
                    behavior.isHideable = true
                    
                    // Calculate ratio for the middle point
                    val midPoint = snapPoints[1].toFloat()
                    val halfExpandedRatio = ((currentHeight - midPoint) / currentHeight).coerceIn(0f, 1f)
                    if (behavior.halfExpandedRatio != halfExpandedRatio) {
                        behavior.halfExpandedRatio = halfExpandedRatio
                    }
                    
                    // Offset for the highest point
                    val topOffset = (currentHeight - snapPoints.last().toFloat()).toInt()
                    val expandedOffset = topOffset.coerceAtLeast(0)
                    if (behavior.expandedOffset != expandedOffset) {
                        behavior.expandedOffset = expandedOffset
                    }
                }
            }
        } else if (isDynamicSizingEnabled) {
            updateDynamicHeight()
        }
    }

    private var externalContentHeight = 0f
    private var externalFooterHeight = 0f

    private fun updateDynamicHeight() {
        // PRODUCTION FIX: Use external height from JS if available, 
        // as it's more accurate for React Native views.
        var contentHeight = if (externalContentHeight > 0) externalContentHeight else 0f
        
        if (contentHeight <= 0f) {
            for (i in 0 until sheetContainer.childCount) {
                contentHeight += sheetContainer.getChildAt(i).measuredHeight.toFloat()
            }
        }
        
        if (contentHeight > 0f) {
            val params = sheetContainer.layoutParams as LayoutParams
            if (params.height != LayoutParams.WRAP_CONTENT) {
                params.height = LayoutParams.WRAP_CONTENT
                sheetContainer.layoutParams = params
            }
            
            val totalNeeded = contentHeight + externalFooterHeight + sheetContainer.paddingTop + sheetContainer.paddingBottom
            behavior.peekHeight = totalNeeded.toInt().coerceAtMost(height)
            behavior.isFitToContents = true
        }
    }

    fun setContentHeight(height: Float) {
        if (Math.abs(this.externalContentHeight - height) > 1) {
            this.externalContentHeight = height
            if (isDynamicSizingEnabled) {
                updateDynamicHeight()
            }
        }
    }

    fun setFooterHeight(height: Float) {
        if (Math.abs(this.externalFooterHeight - height) > 1) {
            this.externalFooterHeight = height
            if (isDynamicSizingEnabled) {
                updateDynamicHeight()
            }
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
