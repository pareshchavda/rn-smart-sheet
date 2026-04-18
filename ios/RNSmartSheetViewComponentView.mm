#import "RNSmartSheetViewComponentView.h"

#import <react/renderer/components/RNSmartSheetSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNSmartSheetSpec/EventEmitters.h>
#import <react/renderer/components/RNSmartSheetSpec/Props.h>
#import <react/renderer/components/RNSmartSheetSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RNSmartSheetViewComponentView () <RCTRNSmartSheetViewViewProtocol, UISheetPresentationControllerDelegate>
@end

@implementation RNSmartSheetViewComponentView {
    UIViewController *_sheetViewController;
    UIView *_contentView;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNSmartSheetViewProps>();
        _props = defaultProps;

        _contentView = [UIView new];
        _sheetViewController = [[UIViewController alloc] init];
        _sheetViewController.view = _contentView;
        _sheetViewController.modalPresentationStyle = UIModalPresentationPageSheet;
    }

    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<RNSmartSheetViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<RNSmartSheetViewProps const>(props);

    if (newViewProps.snapPoints != oldViewProps.snapPoints || newViewProps.enableDynamicSizing != oldViewProps.enableDynamicSizing) {
        [self configureSheet:newViewProps];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)configureSheet:(RNSmartSheetViewProps const &)props
{
    if (@available(iOS 15.0, *)) {
        UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
        if (!sheet) return;

        sheet.delegate = self;
        sheet.prefersGrabberVisible = YES;
        sheet.prefersScrollingExpandsWhenScrolledToEdge = YES;

        NSMutableArray<UISheetPresentationControllerDetent *> *detents = [NSMutableArray new];

        if (props.enableDynamicSizing) {
            if (@available(iOS 16.0, *)) {
                [detents addObject:[UISheetPresentationControllerDetent customDetentWithIdentifier:@"dynamic" resolver:^CGFloat(id<UISheetPresentationControllerDetentResolutionContext> context) {
                    return self->_contentView.intrinsicContentSize.height;
                }]];
            } else {
                [detents addObject:[UISheetPresentationControllerDetent mediumDetent]];
            }
        }

        for (auto const &point : props.snapPoints) {
            if (@available(iOS 16.0, *)) {
                NSString *identifier = [NSString stringWithFormat:@"snap-%f", point];
                [detents addObject:[UISheetPresentationControllerDetent customDetentWithIdentifier:identifier resolver:^CGFloat(id<UISheetPresentationControllerDetentResolutionContext> context) {
                    return (CGFloat)point;
                }]];
            } else {
                // Fallback to medium/large for iOS 15
                if (point > 400) {
                    [detents addObject:[UISheetPresentationControllerDetent largeDetent]];
                } else {
                    [detents addObject:[UISheetPresentationControllerDetent mediumDetent]];
                }
            }
        }

        sheet.detents = detents;
    }
}

- (void)didMoveToWindow
{
    [super didMoveToWindow];
    if (self.window && _sheetViewController.presentingViewController == nil) {
        UIViewController *rootViewController = [self findViewController];
        if (rootViewController) {
            [rootViewController presentViewController:_sheetViewController animated:YES completion:nil];
        }
    }
}

- (UIViewController *)findViewController
{
    UIResponder *responder = self;
    while ([responder isKindOfClass:[UIView class]]) {
        responder = [responder nextResponder];
    }
    return (UIViewController *)responder;
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    _contentView.frame = self.bounds;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [_contentView insertSubview:childComponentView atIndex:index];
    [self updateDynamicHeight];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [childComponentView removeFromSuperview];
    [self updateDynamicHeight];
}

- (void)updateDynamicHeight
{
    if (@available(iOS 15.0, *)) {
        UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
        [sheet invalidateDetents];
    }
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [_sheetViewController dismissViewControllerAnimated:YES completion:nil];
}

#pragma mark - UISheetPresentationControllerDelegate

- (void)sheetPresentationControllerDidChangeSelectedDetentIdentifier:(UISheetPresentationController *)sheetPresentationController API_AVAILABLE(ios(15.0))
{
    if (_eventEmitter) {
        NSInteger currentIndex = -1;
        NSString *identifier = sheetPresentationController.selectedDetentIdentifier;
        
        if (identifier) {
            if ([identifier isEqualToString:@"dynamic"]) {
                currentIndex = 0; // Assume dynamic is at start or specific index
            } else if ([identifier hasPrefix:@"snap-"]) {
                // Logic to find index if needed
                currentIndex = 1; 
            }
        }

        std::static_pointer_cast<RNSmartSheetViewEventEmitter const>(_eventEmitter)
            ->onSheetChange({
                .index = (int32_t)currentIndex,
                .position = (double)_sheetViewController.view.frame.origin.y
            });
    }
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<RNSmartSheetViewComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> RNSmartSheetViewCls(void)
{
    return RNSmartSheetViewComponentView.class;
}
