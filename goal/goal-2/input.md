# 原始输入

```text
# AGENTS.md instructions

<INSTRUCTIONS>
#Goal Mode 工作流
当处于 goal mode，或用户 prompt 包含 /goal 时，必须进入本流程。

在当前涉及到的 project 下创建新的目录：

goal/goal-[num]/
  input.md
  plan.md
  tasks.md
编号递增，不得覆盖已有目录。

如过目前没有 project，你需要新建。

input.md：完整保存用户原始输入，逐字保留，不得改写。
plan.md：分析需求、上下文、风险、执行方案、验证方式、回滚方案。
tasks.md：把 plan 拆成小任务，每个 task 必须可独立验证。每三个task需要一次大型全面检查-debug循环，确保没有bug和问题。
在完成以上文件前，不得修改代码。

每次只执行一个 task。每次你想要结束task的时候，你必须思考：“你对当前实现100% 有信心吗？”如果没有，请找出所有可能的漏洞和提高的方案，提出合适的修复方案，然后不断重复这个循环，直到你对新实现在事实上达到100% 自信为止。
然后你需要提交代码（若有）
在tasks.md中把任务标记为完成并且写上你干的事情（你在tasks.md中需要留空用来干这些事）
然后你需要向用户简单汇报，并且停止输出，然后你会自动开始下一轮task

每次上下文压缩后，你必须全量读取这三个文件，以防止上下文模糊。

全部task完成后，你需要进行最后的最大的review，全面从c端，代码，安全性等角度分析项目，并且进行修缮和测试，直到完美为止。然后把goal标记为完成

goal完成后，你标记这轮goal所创建的goal文件夹为完成状态，然后归档整理。
如果goal文件过多，或者单goal文件内的字数过长，请对goal中间文件进行整理和压缩
</INSTRUCTIONS><environment_context>
  <cwd>/Users/logcjj/Documents/GitHub/luckin-agent-submission</cwd>
  <shell>zsh</shell>
  <current_date>2026-07-20</current_date>
  <timezone>Asia/Shanghai</timezone>
  <filesystem><workspace_roots><root>/Users/logcjj/Documents/GitHub/luckin-agent-submission</root><root>/Users/logcjj/.codex/visualizations/2026/07/20/019f7dfc-1fb3-7003-8c45-aec2bf3387e4</root></workspace_roots><permission_profile type="disabled"><file_system type="unrestricted" /></permission_profile></filesystem>
</environment_context>
```

```text
现在我们继续完善整个内容显示，美观程度以及深度。包括手机端什么的，参考参考[https://github.com/bcefghj?tab=repositories](https://github.com/bcefghj?tab=repositories) 他的项目，不仅仅是小满那个，还有很多，参考人家的深度，内容，agent配置，整体的架构设计，去模仿一下，优化一下我们的项目，包括美术，技术实现，风格（结合瑞星咖啡的官方啥的），包括要不要接什么真实的咖啡信息，以及会员信息，你现在这个有点太空洞了没有深度，咱们去模仿一下他的多个项目，
```
