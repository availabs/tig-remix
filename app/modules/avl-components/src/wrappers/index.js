import withTheme, { useTheme, ThemeContext } from "./with-theme"
import shareProps from "./share-props"

const Wrappers = {
  "with-theme": withTheme,
  "share-props": shareProps,
  
}
export {
  Wrappers,
  withTheme,
  ThemeContext,
  useTheme,
  shareProps
}
