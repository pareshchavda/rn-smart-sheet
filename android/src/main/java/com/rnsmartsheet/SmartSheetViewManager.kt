package com.rnsmartsheet

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
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

    override fun createViewInstance(context: ThemedReactContext): SmartSheetView {
        return SmartSheetView(context)
    }

    @ReactProp(name = "snapPoints")
    override fun setSnapPoints(view: SmartSheetView, value: ReadableArray?) {
        if (value != null && value.size() > 0) {
            val peekHeight = value.getDouble(0).toInt()
            view.behavior.peekHeight = peekHeight
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

    @ReactProp(name = "overDragResistanceFactor")
    override fun setOverDragResistanceFactor(view: SmartSheetView, value: Double) {
    }

    @ReactProp(name = "keyboardBehavior")
    override fun setKeyboardBehavior(view: SmartSheetView, value: String?) {
    }

    @ReactProp(name = "keyboardDismissMode")
    override fun setKeyboardDismissMode(view: SmartSheetView, value: String?) {
    }

    @ReactProp(name = "springConfig")
    override fun setSpringConfig(view: SmartSheetView, value: ReadableMap?) {
    }

    override fun snapToIndex(view: SmartSheetView, index: Int) {
        when (index) {
            -1 -> view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
            0 -> view.behavior.state = BottomSheetBehavior.STATE_COLLAPSED
            else -> view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
        }
    }

    override fun snapToPosition(view: SmartSheetView, position: Double) {
        view.behavior.expandedOffset = position.toInt()
        view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
    }

    override fun expand(view: SmartSheetView) {
        view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
    }

    override fun collapse(view: SmartSheetView) {
        view.behavior.state = BottomSheetBehavior.STATE_COLLAPSED
    }

    override fun close(view: SmartSheetView) {
        view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
    }

    override fun forceClose(view: SmartSheetView) {
        view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .put("topSheetChange", MapBuilder.of("registrationName", "onSheetChange"))
            .put("topSheetAnimate", MapBuilder.of("registrationName", "onSheetAnimate"))
            .put("topSheetPositionChange", MapBuilder.of("registrationName", "onSheetPositionChange"))
            .build()
    }
}
