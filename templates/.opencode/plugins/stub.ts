// Plugin stub — nap vao .opencode/plugins/stub.ts
// Plugin nay tu dong duoc discover boi OpenCode khi nam trong .opencode/plugins/
// API Reference: https://opencode.ai/v2/docs/build/plugins/ (verify 28/10/2026, v2.2.0)
// Package: @opencode/plugin (import tu day)

// === Dinh nghia plugin ===
// Plugin.define tao mot plugin co id duy nhat. Plugin co the co nhieu phan: server, tui, gui, rpc
// Day la phan server (chay trong OpenCode server)
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  // id phai duy nhat trong project/location hien tai
  // Neu trung id voi plugin khac, plugin sau ghi de plugin truoc
  id: "example",

  // setup() chay khi plugin duoc load
  // Tra ve ham cleanup chay khi plugin unload
  async setup(ctx) {
    // --- Context co gi? ---
    // ctx la OpenCode server client — giong nhu API cua opencode SDK
    // ctx.cac phuong thuc: tool, agent, mcp, session, command, storage, ...
    console.log(`[stub] loaded in OpenCode ${ctx.app.version}`)
    console.log(`[stub] location: ${ctx.location.directory}`)

    // --- Luu gia tri JSON dai han (persistent, rieng tung plugin) ---
    // Storage la mot key-value nho gon, gia tri con sau restart OpenCode
    await ctx.storage.set("loaded", true)

    // --- Dang ky mot hook tren session ---
    // Hook chay truoc moi model request trong agent loop
    // Chi can 1 hook la du — khong can dang ky nhieu
    const registration = await ctx.session.hook(
      // "context" = hook cho agent loop (tool-driven continuations)
      // Cac hook khac: "prompt" (truoc khi admission), "compaction" (truoc compact),
      // "http.request" (truoc HTTP), "retry" (khi retry)
      // Reference: https://opencode.ai/v2/docs/build/plugins/server#hooks
      "context",
      (event) => {
        // event chua: system (array them system instruction), tools (them/xoa tool),
        // options (temperature, maxTokens, ...), metadata
        //
        // === Vi du: them system instruction cho moi request ===
        event.system.push({
          type: "text",
          text: "Always check for SQL injection before writing queries.",
        })

        // === Vi du: gioi han output tokens cho tat ca request ===
        event.options.maxTokens = 8000

        console.log("[stub] hook: context request intercepted")
      }
    )

    // --- Dang ky mot tool tu plugin ---
    // ctx.tool.transform cho phep them, sua, xoa tool trong luc plugin setup
    // Tool o day chi hoat dong trong Code Mode (JavaScript interpreter) — khong phai tool call truc tiep
    // Vi du: tool "stub_hello" chi goi duoc khi agent goi execute trong Code Mode
    const toolReg = await ctx.tool.transform((editor) => {
      editor.namespace({ name: "stub", description: "Example plugin tools" })
      editor.add({
        name: "hello",
        description: "Tra ve loi chao",
        input: {
          type: "object",
          properties: {
            name: { type: "string", description: "Ten de xin chao" },
          },
          required: ["name"],
          additionalProperties: false,
        },
        // options: {} co the chua codemode: true de tool chi hoat dong trong Code Mode
        options: { namespace: "stub", codemode: true },
        async execute(input, context) {
          // context chua: sessionID, messageID, progress, signal (abort)
          // Neu can huy duoc, truyen signal vao fetch / async operation
          await context.progress({ status: "Processing..." })
          return {
            content: `Xin chao ${(input as { name: string }).name}!`,
          }
        },
      })
    })

    // --- Cleanup khi unload ---
    // Tra ham de dispose tat ca registration khi plugin bi unload
    return () => {
      console.log("[stub] unloading...")
      registration.dispose().catch(console.error)
      toolReg.dispose().catch(console.error)
    }
  },
})
