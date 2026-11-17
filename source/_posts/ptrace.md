---
title: "ptrace：调试器怎样控制程序"
slug: ptrace
date: "2026-11-16 17:24:53"
categories:
  - "操作系统原理"
tags:
  - Linux
  - ptrace
  - GDB
  - strace
  - "系统调用"
  - "进程调试"
---


**Linux Process Tracing**

在 GDB 里给 `hello` 打一个断点。程序跑到断点就停下，你可以查看变量，再让程序继续。在 Linux 上，GDB 用 `ptrace` 来做这件事。

下面只跟踪一次调试：让 `hello` 停在打印数字之前，看看这个数字，再把它打印出来。

## GDB 调试示例：启动 hello

```c
#include <stdio.h>

int main(void) {
    int count = 3;
    printf("%d\n", count);  // 在这里打断点
    return 0;
}
```

将上面的代码保存为 `hello.c`。

```text
$ cc -g -O0 hello.c -o hello   # 编译成 hello，保留调试信息并关闭优化
$ gdb ./hello                 # 启动 GDB，载入 hello
(gdb) break hello.c:5         # 在第 5 行的打印语句前设置断点
(gdb) run                     # 运行 hello，让它在断点处停下
```

输入 `run` 后，GDB 创建一个子进程来运行 `hello`。子进程执行 `hello`，GDB 负责调试它。

在加载 `hello` 之前，子进程先向内核登记：“让我的父进程调试我。”这就是 `PTRACE_TRACEME`。接下来，子进程用 `execve` 加载 `hello`，替换自己正在运行的程序。它还是刚才那个子进程，内核已经知道它由 GDB 追踪。

## 断点处理与执行恢复

源代码里的第 5 行，到了 CPU 那里就是一段机器指令。调试信息能帮 GDB 找到这行对应的指令地址。以常见的软件断点为例，GDB 在那里放一条特殊指令：CPU 执行到它时，会报告一次异常，内核就能让 `hello` 停下来。

GDB 调用 `waitpid`，等内核告诉它 `hello` 是否已经停下。`waitpid` 是用来等待进程状态变化的接口，比如子进程退出，或者被调试的程序停住。GDB 收到停止报告后，再检查 `hello` 停在哪儿，判断它是不是碰到了第 5 行的断点。`waitpid` 只报告状态，不会让程序停下来。

等 GDB 显示提示符时，`hello` 已经停在打印之前。现在输入 `print count`，看到的是 `3`。GDB 根据调试信息找到变量的位置，再读取目标的内存或寄存器来取值。你看到的是 C 变量，内核提供的是读取机器状态的能力。

输入 `continue` 后，GDB 处理好刚命中的断点，让 `hello` 恢复执行。打印语句这时才运行，终端上才出现 `3`。这一趟里，两个程序轮流工作：`hello` 跑到断点后停着，GDB 检查现场；GDB 发出继续指令，`hello` 接着跑。

## ptrace 与 strace 的区别

`ptrace` 是 Linux 内核提供的接口。`strace` 是一个命令行工具，它用这个接口观察程序向内核发了什么请求，以及请求的结果。比如，想知道 `cat` 有没有尝试打开一个不存在的文件，可以在 Linux 上运行：

```sh
strace -e trace=openat cat ./missing.txt
```

如果输出里有 `openat(AT_FDCWD, "./missing.txt", O_RDONLY) = -1 ENOENT`，你就知道 `cat` 确实尝试打开那个路径，而且打开请求失败了。`ENOENT` 表示文件或路径中的某一部分不存在。

这一行的信息来自两次观察。进入 `openat` 时，目标先停一次，`strace` 能看到它想打开哪个文件。等内核处理完这个请求，目标再停一次，`strace` 这才拿到结果。让目标按这种方式运行的请求叫 `PTRACE_SYSCALL`。有了入口的参数和出口的结果，`strace` 才能把一次调用写成一行。

## 进程附加与线程追踪

如果 `hello` 已经跑起来，就不用从头启动。权限允许时，GDB 可以附加到它；Linux 提供的请求之一叫 `PTRACE_ATTACH`。这个请求会向目标发出停止信号。请求返回时，目标可能还没停，所以 GDB 仍要等内核报告停止状态，才能检查现场。即便两个程序属于同一个用户，Yama 等安全策略也可能不允许附加。

前面的 `hello` 只有一个线程。程序有多个线程时，Linux 按线程建立追踪关系；一个线程停住，不代表其他线程也自动停住。GDB 默认会协调其他线程一起停下，所以我们平时在 GDB 里往往感觉是整个程序停了。

## ptrace 的原理

GDB 和 `hello` 各有自己的内存。GDB 不能像读自己的变量那样直接读 `hello` 的变量，也不能直接命令它停下。内核负责安排哪个线程能在 CPU 上运行，也能访问各个进程的内存。所以 GDB 要检查或控制 `hello`，得向内核提出请求。**`ptrace` 就是 Linux 提供给调试器的请求接口。**

内核先确认 GDB 有权追踪目标，并记住这层关系。当 `hello` 命中断点，内核把那个线程停住，并把停止状态交给正在等待的 GDB。此时 `hello` 不会自己跑到下一条指令。GDB 可以慢慢检查刚才停住的现场，比如看指令执行到了哪儿、`count` 的值是多少。

等你输入 `continue`，GDB 再通过 `ptrace` 请求内核恢复 `hello`。从停下来到继续跑，GDB 负责决定怎么调试，内核负责执行这些操作。

参考：[Linux ptrace(2) 手册](https://man7.org/linux/man-pages/man2/ptrace.2.html)、[GDB 断点文档](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Set-Breaks.html)、[GDB all-stop 模式](https://sourceware.org/gdb/current/onlinedocs/gdb.html/All_002dStop-Mode.html)、[strace 项目主页](https://strace.io/)、[Linux Yama 文档](https://docs.kernel.org/admin-guide/LSM/Yama.html)。
