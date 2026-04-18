#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTFabricComponentsPlugins.h"

@interface RNSmartSheetViewManager : RCTViewManager
@end

@implementation RNSmartSheetViewManager

RCT_EXPORT_MODULE(RNSmartSheetView)

- (UIView *)view
{
  return [UIView new];
}

RCT_EXPORT_VIEW_PROPERTY(snapPoints, NSArray)
RCT_EXPORT_VIEW_PROPERTY(initialIndex, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(enablePanDownToClose, BOOL)
RCT_EXPORT_VIEW_PROPERTY(enableGesture, BOOL)
RCT_EXPORT_VIEW_PROPERTY(enableDynamicSizing, BOOL)
RCT_EXPORT_VIEW_PROPERTY(keyboardBehavior, NSString)
RCT_EXPORT_VIEW_PROPERTY(keyboardDismissMode, NSString)

@end
