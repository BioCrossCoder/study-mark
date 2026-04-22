import { ref } from "vue";

export default function HelloWorld(props: { msg: String }) {
  const count = ref(0);

  vineStyle.scoped(scss`
    .read-the-docs {
      color: #888;
    }
  `);

  return vine`
    <h1>{{ msg }}</h1>

    <div class="card">
        <button type="button" @click="count++">count is {{ count }}</button>
        <p>
        Edit
        <code>components/HelloWorld.vue</code> to test HMR
        </p>
    </div>

    <p>
        Install
        <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
        in your IDE for a better DX
    </p>
    <p class="read-the-docs">Click on the WXT and Vue logos to learn more</p>
  `;
}
