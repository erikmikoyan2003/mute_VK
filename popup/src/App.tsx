import React from "react";

import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Main from "./components/Main";
import Footer from "./components/Footer";
import SettingsInterface from "./interfaces/settings.interface";

const settingsByDefault: SettingsInterface = {
  mode: "Simple",
  isBlurMode: false,
  isHideOnlyInChats: false,
  isAutoCensorship: false,
};

class App extends React.Component<
  {},
  {
    activeTab: "Users" | "Settings";
    banList?: String[];
    settings?: SettingsInterface;
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      activeTab: "Users",
    };
    this.changeTab = this.changeTab.bind(this);
  }

  async init(): Promise<SettingsInterface> {
    let storage = await chrome.storage.local.get(["banList", "settings"]);
    let settings: SettingsInterface = storage.settings,
      banList: String[] = storage.banList;

    if (!settings) {
      settings = settingsByDefault;
      await chrome.storage.local.set({ settings: settings });
    } else {
      settings = {
        mode: settings.mode || settingsByDefault.mode,
        isBlurMode: settings.isBlurMode || settingsByDefault.isBlurMode,
        isHideOnlyInChats:
          settings.isHideOnlyInChats || settingsByDefault.isHideOnlyInChats,
        isAutoCensorship:
          settings.isAutoCensorship || settingsByDefault.isAutoCensorship,
      };
    }
    this.setState({ settings: settings, banList: banList });

    return settings;
  }

  async componentDidMount(): Promise<void> {
    await this.init();
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace == "local") {
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
          if (key == "banList") {
            this.setState({banList: newValue})
          } else if (key == "settings") {
            this.setState({settings: newValue})
          }
        }
      }
    });
  }

  /**
   * Change active tab in component state
   *
   * @param {"Users" | "Settings"} tabName
   * Name of tab, that was activated by the user
   */
  changeTab(tabName: "Users" | "Settings") {
    this.setState({
      activeTab: tabName,
    });
  }

  render(): React.ReactNode {
    return (
      <>
        <Header />

        <div id="containerForNavBarAndMain">
          <NavBar activeTab={this.state.activeTab} changeTab={this.changeTab} />
          <Main
            activeTab={this.state.activeTab}
            settings={this.state.settings || settingsByDefault}
            changeTab={this.changeTab}
            banList={this.state.banList || []}
          />
        </div>

        <Footer />
      </>
    );
  }
}

export default App;