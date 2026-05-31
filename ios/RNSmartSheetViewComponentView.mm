#import "RNSmartSheetViewComponentView.h"

#import <react/renderer/components/RNSmartSheetSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNSmartSheetSpec/EventEmitters.h>
#import <react/renderer/components/RNSmartSheetSpec/Props.h>
#import <react/renderer/components/RNSmartSheetSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@class RNSmartSheetViewComponentView;

@interface RNSmartSheetViewController : UIViewController
@property (nonatomic, weak) RNSmartSheetViewComponentView *componentView;
@end

@interface RNSmartSheetViewComponentView () <RCTRNSmartSheetViewViewProtocol, UISheetPresentationControllerDelegate>
- (void)sheetViewControllerDidLayoutSubviews;
@end

@implementation RNSmartSheetViewController

- (void)viewDidLayoutSubviews
{
    [super viewDidLayoutSubviews];
    [self.componentView sheetViewControllerDidLayoutSubviews];
}

@end

@implementation RNSmartSheetViewComponentView {
    UIViewController *_sheetViewController;
    UIView *_contentView;
    BOOL _isKeyboardVisible;
    CGFloat _lastSheetY;
    NSString *_lastSelectedDetentIdentifier;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNSmartSheetViewProps>();
        _props = defaultProps;

        _contentView = [UIView new];
        RNSmartSheetViewController *vc = [[RNSmartSheetViewController alloc] init];
        vc.componentView = self;
        _sheetViewController = vc;
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
                [detents addObject:[UISheetPresentationControllerDetent largeDetent]];
            } else {
                [detents addObject:[UISheetPresentationControllerDetent mediumDetent]];
                [detents addObject:[UISheetPresentationControllerDetent largeDetent]];
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
            [self registerKeyboardObservers];
        }
    } else if (!self.window) {
        [self unregisterKeyboardObservers];
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
    [self unregisterKeyboardObservers];
}

- (void)registerKeyboardObservers
{
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWillShow:)
                                                 name:UIKeyboardWillShowNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWillHide:)
                                                 name:UIKeyboardWillHideNotification
                                               object:nil];
}

- (void)unregisterKeyboardObservers
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillHideNotification object:nil];
}

- (void)keyboardWillShow:(NSNotification *)notification
{
    const auto &viewProps = *std::static_pointer_cast<RNSmartSheetViewProps const>(_props);
    
    NSDictionary *userInfo = notification.userInfo;
    CGRect keyboardFrame = [userInfo[UIKeyboardFrameEndUserInfoKey] CGRectValue];
    double duration = [userInfo[UIKeyboardAnimationDurationUserInfoKey] doubleValue];
    UIViewAnimationCurve curve = (UIViewAnimationCurve)[userInfo[UIKeyboardAnimationCurveUserInfoKey] integerValue];
    
    CGFloat keyboardHeight = keyboardFrame.size.height;
    
    _isKeyboardVisible = YES;
    _lastSheetY = [_sheetViewController.view convertPoint:CGPointZero toView:nil].y;
    
    if (@available(iOS 15.0, *)) {
        UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
        if (sheet) {
            _lastSelectedDetentIdentifier = sheet.selectedDetentIdentifier;
        }
    }
    
    if (viewProps.keyboardBehavior == "extend" || viewProps.keyboardBehavior == "fillParent" || viewProps.enableDynamicSizing) {
        if (@available(iOS 15.0, *)) {
            UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
            if (sheet && sheet.detents.count > 0) {
                UISheetPresentationControllerDetent *highestDetent = sheet.detents.lastObject;
                [sheet animateChanges:^{
                    sheet.selectedDetentIdentifier = highestDetent.identifier;
                }];
            }
        }
    }
    
    [UIView animateWithDuration:duration delay:0 options:(curve << 16) animations:^{
        CGRect bounds = self->_contentView.bounds;
        bounds.origin.y = keyboardHeight;
        self->_contentView.bounds = bounds;
    } completion:nil];
}

- (void)keyboardWillHide:(NSNotification *)notification
{
    const auto &viewProps = *std::static_pointer_cast<RNSmartSheetViewProps const>(_props);
    NSDictionary *userInfo = notification.userInfo;
    double duration = [userInfo[UIKeyboardAnimationDurationUserInfoKey] doubleValue];
    UIViewAnimationCurve curve = (UIViewAnimationCurve)[userInfo[UIKeyboardAnimationCurveUserInfoKey] integerValue];
    
    _isKeyboardVisible = NO;
    _lastSheetY = 0;
    
    if (viewProps.keyboardBehavior == "extend" || viewProps.keyboardBehavior == "fillParent" || viewProps.enableDynamicSizing) {
        if (@available(iOS 15.0, *)) {
            UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
            if (sheet && _lastSelectedDetentIdentifier) {
                [sheet animateChanges:^{
                    sheet.selectedDetentIdentifier = _lastSelectedDetentIdentifier;
                }];
            }
        }
    }
    
    [UIView animateWithDuration:duration delay:0 options:(curve << 16) animations:^{
        CGRect bounds = self->_contentView.bounds;
        bounds.origin.y = 0;
        self->_contentView.bounds = bounds;
    } completion:nil];
}

- (void)sheetViewControllerDidLayoutSubviews
{
    if (_isKeyboardVisible) {
        const auto &viewProps = *std::static_pointer_cast<RNSmartSheetViewProps const>(_props);
        if (viewProps.keyboardDismissMode == "on-drag") {
            CGPoint absoluteOrigin = [_sheetViewController.view convertPoint:CGPointZero toView:nil];
            CGFloat currentY = absoluteOrigin.y;
            if (_lastSheetY > 0 && currentY > _lastSheetY + 10) {
                [_contentView endEditing:YES];
            }
        }
    }
}

- (void)snapToIndex:(NSInteger)index
{
    if (@available(iOS 15.0, *)) {
        UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
        if (sheet && sheet.detents.count > 0) {
            if (index == -1) {
                [_sheetViewController dismissViewControllerAnimated:YES completion:nil];
                return;
            }
            
            UISheetPresentationControllerDetent *targetDetent = nil;
            if (index < sheet.detents.count) {
                targetDetent = sheet.detents[index];
            } else {
                targetDetent = sheet.detents.lastObject;
            }
            [sheet animateChanges:^{
                sheet.selectedDetentIdentifier = targetDetent.identifier;
            }];
        }
    }
}

- (void)snapToPosition:(double)position
{
    if (@available(iOS 15.0, *)) {
        UISheetPresentationController *sheet = _sheetViewController.sheetPresentationController;
        if (sheet && sheet.detents.count > 0) {
            UISheetPresentationControllerDetent *targetDetent = sheet.detents.lastObject;
            [sheet animateChanges:^{
                sheet.selectedDetentIdentifier = targetDetent.identifier;
            }];
        }
    }
}

- (void)close
{
    [_sheetViewController dismissViewControllerAnimated:YES completion:nil];
}

- (void)forceClose
{
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
