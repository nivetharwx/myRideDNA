package com.myridedna;

import android.app.Application;

import android.content.IntentFilter;
import com.facebook.react.ReactApplication;
import io.rumors.reactnativesettings.RNSettingsPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.mapbox.rctmgl.RCTMGLPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import io.rumors.reactnativesettings.RNSettingsPackage;
import io.rumors.reactnativesettings.receivers.GpsLocationReceiver;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.mapbox.rctmgl.RCTMGLPackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new MainReactPackage(),
            new RNSettingsPackage(),
            new ReactNativeContacts(),
            new RCTMGLPackage(),
            new RNFetchBlobPackage(),
            new PickerPackage(), new RNSettingsPackage(), new RCTMGLPackage(),
          new RNDeviceInfo(), new RNCameraPackage(), new VectorIconsPackage(),
          new RNFusedLocationPackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    registerReceiver(new GpsLocationReceiver(), new IntentFilter("android.location.PROVIDERS_CHANGED"));
  }
}
