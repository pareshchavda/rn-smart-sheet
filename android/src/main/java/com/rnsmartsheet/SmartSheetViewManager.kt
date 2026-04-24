package com.rnsmartsheet

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import android.util.Log
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNSmartSheetViewManagerDelegate
import com.facebook.react.viewmanagers.RNSmartSheetViewManagerInterface
import com.google.android.material.bottomsheet.BottomSheetBehavior

class SmartSheetViewManager : ViewGroupManager<SmartSheetView>(), RNSmartSheetViewManagerInterface<SmartSheetView> {

    companion object {
        const val REACT_CLASS = "RNSmartSheetView"
    }

    private val mDelegate: ViewManagerDelegate<SmartSheetView> = RNSmartSheetViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<SmartSheetView> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun receiveCommand(view: SmartSheetView, commandId: String, args: ReadableArray?) {
        Log.d(REACT_CLASS, "receiveCommand: $commandId")
        System.out.println("RNSmartSheet: receiveCommand String: $commandId")
        when (commandId) {
            "snapToIndex" -> args?.let { snapToIndex(view, it.getInt(0)) }
            "snapToPosition" -> args?.let { snapToPosition(view, it.getDouble(0)) }
            "expand" -> expand(view)
            "collapse" -> collapse(view)
            "close" -> close(view)
            "forceClose" -> forceClose(view)
        }
    }

    override fun receiveCommand(view: SmartSheetView, commandId: Int, args: ReadableArray?) {
        Log.d(REACT_CLASS, "receiveCommand (Int): $commandId")
        System.out.println("RNSmartSheet: receiveCommand Int: $commandId")
        when (commandId) {
            1 -> args?.let { snapToIndex(view, it.getInt(0)) } // snapToIndex
            2 -> args?.let { snapToPosition(view, it.getDouble(0)) } // snapToPosition
            3 -> expand(view) // expand
            4 -> collapse(view) // collapse
            5 -> close(view) // close
            6 -> forceClose(view) // forceClose
        }
    }

    override fun createViewInstance(context: ThemedReactContext): SmartSheetView {
        return SmartSheetView(context)
    }

    @ReactProp(name = "snapPoints")
    override fun setSnapPoints(view: SmartSheetView, value: ReadableArray?) {
        if (value != null) {
            val points = mutableListOf<Double>()
            for (i in 0 until value.size()) {
                points.add(value.getDouble(i))
            }
            view.setSnapPoints(points)
        }
    }

    @ReactProp(name = "initialIndex")
    override fun setInitialIndex(view: SmartSheetView, value: Int) {
        when (value) {
            0 -> view.behavior.state = BottomSheetBehavior.STATE_COLLAPSED
            -1 -> view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
            else -> if (value > 0) view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
        }
    }

    @ReactProp(name = "enablePanDownToClose")
    override fun setEnablePanDownToClose(view: SmartSheetView, value: Boolean) {
        view.behavior.isHideable = value
    }

    @ReactProp(name = "enableGesture")
    override fun setEnableGesture(view: SmartSheetView, value: Boolean) {
        view.behavior.isDraggable = value
    }

    @ReactProp(name = "enableDynamicSizing")
    override fun setEnableDynamicSizing(view: SmartSheetView, value: Boolean) {
        view.setEnableDynamicSizing(value)
    }

    @ReactProp(name = "overDragResistanceFactor")
    override fun setOverDragResistanceFactor(view: SmartSheetView, value: Double) {
    }

    @ReactProp(name = "keyboardBehavior")
    override fun setKeyboardBehavior(view: SmartSheetView, value: String?) {
        view.setKeyboardBehavior(value)
    }

    @ReactProp(name = "keyboardDismissMode")
    override fun setKeyboardDismissMode(view: SmartSheetView, value: String?) {
    }

    @ReactProp(name = "springConfig")
    override fun setSpringConfig(view: SmartSheetView, value: ReadableMap?) {
    }

    override fun snapToIndex(view: SmartSheetView, index: Int) {
        Log.d(REACT_CLASS, "snapToIndex: $index")
        when (index) {
            -1 -> view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
            0 -> view.behavior.state = BottomSheetBehavior.STATE_COLLAPSED
            1 -> view.behavior.state = BottomSheetBehavior.STATE_HALF_EXPANDED
            else -> view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
        }
        view.requestLayout()
    }

    override fun snapToPosition(view: SmartSheetView, position: Double) {
        Log.d(REACT_CLASS, "snapToPosition: $position")
        val pixelPosition = PixelUtil.toPixelFromDIP(position)
        view.behavior.expandedOffset = (view.height - pixelPosition).toInt().coerceAtLeast(0)
        view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
    }

    override fun expand(view: SmartSheetView) {
        Log.d(REACT_CLASS, "expand")
        System.out.println("RNSmartSheet: expand called")
        view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
        view.requestLayout()
    }

    override fun collapse(view: SmartSheetView) {
        Log.d(REACT_CLASS, "collapse")
        view.behavior.state = BottomSheetBehavior.STATE_COLLAPSED
        view.requestLayout()
    }

    override fun close(view: SmartSheetView) {
        Log.d(REACT_CLASS, "close")
        view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
        view.requestLayout()
    }

    override fun forceClose(view: SmartSheetView) {
        Log.d(REACT_CLASS, "forceClose")
        view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
        view.requestLayout()
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .put("topSheetChange", MapBuilder.of("registrationName", "onSheetChange"))
            .put("topSheetAnimate", MapBuilder.of("registrationName", "onSheetAnimate"))
            .put("topSheetPositionChange", MapBuilder.of("registrationName", "onSheetPositionChange"))
            .build()
    }
}
