import Foundation
import UIKit
import NitroModules

@objc protocol SmartSheetViewProtocol {
    func snapToIndex(_ index: Int)
    func snapToPosition(_ position: Double)
    func close()
    func forceClose()
}

@objc(HybridSmartSheetHelper)
public class HybridSmartSheetHelper: HybridSmartSheetHelperSpec_base, HybridSmartSheetHelperSpec {
    
    private func findView(withTag tag: Int, inView view: UIView) -> UIView? {
        if view.tag == tag {
            return view
        }
        if view.responds(to: Selector(("reactTag"))) {
            if let reactTag = view.perform(Selector(("reactTag")))?.takeUnretainedValue() as? Int, reactTag == tag {
                return view
            }
        }
        for subview in view.subviews {
            if let found = findView(withTag: tag, inView: subview) {
                return found
            }
        }
        return nil
    }

    private func findTargetView(withTag tag: Int) -> SmartSheetViewProtocol? {
        var foundView: UIView? = nil
        if Thread.isMainThread {
            for window in UIApplication.shared.windows {
                if let view = findView(withTag: tag, inView: window) {
                    foundView = view
                    break
                }
            }
        } else {
            DispatchQueue.main.sync {
                for window in UIApplication.shared.windows {
                    if let view = findView(withTag: tag, inView: window) {
                        foundView = view
                        break
                    }
                }
            }
        }
        return foundView as? SmartSheetViewProtocol
    }

    public func snapToIndex(viewTag: Double, index: Double) throws {
        DispatchQueue.main.async {
            if let sheetView = self.findTargetView(withTag: Int(viewTag)) {
                sheetView.snapToIndex(Int(index))
            }
        }
    }

    public func snapToPosition(viewTag: Double, position: Double) throws {
        DispatchQueue.main.async {
            if let sheetView = self.findTargetView(withTag: Int(viewTag)) {
                sheetView.snapToPosition(position)
            }
        }
    }

    public func close(viewTag: Double) throws {
        DispatchQueue.main.async {
            if let sheetView = self.findTargetView(withTag: Int(viewTag)) {
                sheetView.close()
            }
        }
    }

    public func forceClose(viewTag: Double) throws {
        DispatchQueue.main.async {
            if let sheetView = self.findTargetView(withTag: Int(viewTag)) {
                sheetView.forceClose()
            }
        }
    }
}
