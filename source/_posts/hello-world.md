---
title: Hello World
---
Welcome to [Hexo](https://hexo.io/)! This is your very first post. Check [documentation](https://hexo.io/docs/) for more info. If you get any problems when using Hexo, you can find the answer in [troubleshooting](https://hexo.io/docs/troubleshooting.html) or you can ask me on [GitHub](https://github.com/hexojs/hexo/issues).

## Quick Start

### Create a new post

``` bash
$ hexo new "My New Post"
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server

``` bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

``` bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/one-command-deployment.html)

## Code Samples

### Java

``` java
import java.util.ArrayList;
import java.util.List;

public class Example {
    public static void main(String[] args) {
        List<String> items = new ArrayList<>();
        items.add("alpha");
        items.add("beta");
        items.add("gamma");

        for (String item : items) {
            System.out.println("item = " + item);
        }

        String result = items.stream()
                .filter(s -> s.length() > 4)
                .findFirst()
                .orElse("empty");
        System.out.println("result = " + result);
    }
}
```

### Go

``` go
package main

import (
    "fmt"
    "strings"
    "time"
)

func main() {
    now := time.Now()
    fmt.Printf("now: %v\n", now.Format(time.RFC3339))

    words := strings.Split("hello world from go", " ")
    for i, w := range words {
        fmt.Printf("%d: %s\n", i, w)
    }

    ch := make(chan int, 3)
    go func() {
        for i := 0; i < 3; i++ {
            ch <- i * i
        }
        close(ch)
    }()

    for v := range ch {
        fmt.Println("received:", v)
    }
}
```

### TypeScript

``` typescript
interface User {
    id: number;
    name: string;
    email?: string;
}

const users: User[] = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie", email: "charlie@example.com" },
];

function greet(user: User): string {
    const emailPart = user.email ? ` <${user.email}>` : "";
    return `Hello, ${user.name}${emailPart}`;
}

users.forEach((u) => {
    console.log(greet(u));
});

const withEmail = users.filter((u) => Boolean(u.email));
console.log(`users with email: ${withEmail.length}`);
```

