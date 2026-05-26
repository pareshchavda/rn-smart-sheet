#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNSmartSheetViewComponentView : RCTViewComponentView

- (void)snapToIndex:(NSInteger)index;
- (void)snapToPosition:(double)position;
- (void)close;
- (void)forceClose;

@end

NS_ASSUME_NONNULL_END
