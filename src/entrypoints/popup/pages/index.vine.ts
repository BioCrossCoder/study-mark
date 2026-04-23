export default function Page() {
  return vine`
    <div>
    <a href="https://wxt.dev" target="_blank">
      <img src="/wxt.svg" class="h-[6em] p-[1.5em] will-change-filter transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#54bc4ae0]" alt="WXT logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="h-[6em] p-[1.5em] will-change-filter transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#42b883aa]" alt="Vue logo" />
    </a>
    </div>
  `;
}
