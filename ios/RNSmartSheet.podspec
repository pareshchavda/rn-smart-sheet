Pod::Spec.new do |s|
  s.name         = "RNSmartSheet"
  s.version      = "1.0.0"
  s.summary      = "Fabric-ready bottom sheet for React Native"
  s.license      = { :type => "MIT" }
  s.homepage     = "https://example.com"
  s.author       = "RNSmartSheet"
  s.source       = { :git => "", :tag => s.version.to_s }
  s.platforms    = { :ios => "13.4" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"

  install_modules_dependencies(s)
end
