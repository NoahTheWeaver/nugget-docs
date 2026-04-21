import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { watch } from 'vue'
import './custom.css'

const HYPOTHESIS_SRC = 'https://hypothes.is/embed.js'

/**
 * Inject or remove the Hypothesis client script based on a per-page
 * frontmatter flag.
 *
 * Disable on a page with:
 *
 *   ---
 *   hypothesis: false
 *   ---
 *
 * Limitation: once the Hypothesis client has loaded during a session,
 * removing the script tag does not tear down the already-running
 * widget. The flag is reliable on direct page load / hard refresh.
 * In practice that's enough for "hide commenting on this page" use
 * cases like the home page and role landing pages.
 */
function syncHypothesisScript(enabled) {
  if (typeof document === 'undefined') return
  const existing = document.querySelector(`script[src="${HYPOTHESIS_SRC}"]`)
  if (enabled) {
    if (!existing) {
      const s = document.createElement('script')
      s.src = HYPOTHESIS_SRC
      s.async = true
      document.head.appendChild(s)
    }
  } else if (existing) {
    existing.remove()
  }
}

export default {
  extends: DefaultTheme,
  setup() {
    if (typeof window === 'undefined') return
    const { frontmatter } = useData()
    watch(
      () => frontmatter.value?.hypothesis !== false,
      (enabled) => syncHypothesisScript(enabled),
      { immediate: true },
    )
  },
}
