import React from "react";
import AppErrorScreen from "./AppErrorScreen";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("AppErrorBoundary caught an error", error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <AppErrorScreen error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
