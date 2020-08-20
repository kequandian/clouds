# CrudlessHub快速使用

## 1. 使用目的

通过配置编排<span style="color:red;font-weight:bold">crudless.yml</span>文件内容并搭配NodeJS工具 *（`curdless`指令）*  生成详细的**前后端与数据库的**配置文件，最后再配合`zero-json` *（**前端**代码生成工具）* 与`cg-api-cli` *（**后端**代码生成工具）* 配合生成**可即时运行**的总代码。

## 2. 相关链接

>**Tips：地址无法访问则需联系管理员接入授权。**

- [curdless工具地址](https://github.com/kequandian/hub.crudless.zerocode)
- [zero-json工具地址](https://github.com/kequandian/zero-json)
- [cg-api-cli工具地址](https://github.com/zelejs/cg-api-cli)
- [dev-cli工具地址](https://github.com/kequandian/dev-cli)
- [crudless.yml模板](https://github.com/kequandian/hub.crudless.zerocode/blob/master/crudless.yml)
- [cruds.json说明](https://github.com/kequandian/hub.crudless.zerocode/blob/master/cruds.md)

## 3. 构建crudless.yml

>直接基于业务理解定义应用服务，各实体单元包括列表以详情字段，还可以自动构建数据库SQL文件，自动生成API代码。

可参考[crudless.yml](https://github.com/kequandian/hub.crudless.zerocode/blob/master/crudless.yml)模板进行自定义编排，其中**关键部分解释** 直接查看定义文件内容注释

## 4. crudless 生成文件

根据 <u>**2. 相关链接**</u> 中的crudless工具地址拉取并安装。
```shell
$ npm i -g 

## or below two lines after clone

$ npm install
$ npm link
```
使用其生成相应配置文件。

```shell
# 切换至crudless.yml同级目录下后执行crudless如下所示
$ crudless  
outPath:  ./test.json
outSQLPath:  ./crudless.sql
$ crudless -h
crudless  ## 默认找同目录的 crudless.yml，并且默认输出前后端配置文件
crudless -f /path/to/crudless.yml  ## 指定文件并输出所有配置文件
crudless -f /path/to/crudless.yml --json --sql --crud  ## 按不同参数输出相应配置文件
```

执行完毕后将生成`test.json`和`crudless.sql`两份文件。

>正式版本将生成三份文件：
>
>- **test.json**：用于配合zero-json生成前端页面；
>- **crudless.sql**：用于配合cg-api-cli生成后端代码；
>- ***.crud.json**：用于配合cg-api-cli生成SQL表之间的关系，如：业务逻辑关系的数据库设计中，表与表之关的关系，如单表，一对多等。

## 5. zero-json生成前端

>**Tips：使用zero-json需先[初始化 web 后台管理项目](https://github.com/kequandian/zero-json/blob/master/doc/README.md)。**

利用在上述 <u>**4. crudless生成文件**</u> 中生成`*.json`文件，再配合zero-json即可快速生成前端代码。

假设现在需要生成一个名字叫 `myPage` 的 CRUD 页面，同时新建一个目录存放 json 配置文件以方便管理, 例如 `./buildJSON`，最后将上述生成的 [`test.json`](https://github.com/kequandian/zero-json/blob/master/doc/build.json.md) 文件放进里面

```
$ mv ./test.json ./buildJSON/test.json
```

因为后台管理项目的页面必须要放在 `web/src/pages` 目录下, 故而通过 `-o` 来将生成的文件重定向至 `./src/pages`

```
$ zero-json manage crud myPage -i ./buildJSON/test.json -o ./src/pages
```

至此页面就已经生成在 `./src/pages/myPage`

## 6. cg-api-cli生成后端

根据 <u>**2. 相关链接**</u> 中的cg-api-cli工具地址拉取并使用其生成相应配置文件，如下所示：

```
Usage: cg-api-cli <module> <sql> <cruds>

Example:
  cg-api-cil test test.sql test.json

Paramters:
  module	代码模块名
  sql		sql文件路径
  cruds		cruds文件路径
```

> **Tips：其中[*.cruds.json](https://github.com/kequandian/hub.crudless.zerocode/blob/master/cruds.md)文件可自行查阅文档。**
>
> 执行命令后会新建一个项目名和**module**同名的maven项目，后续可用maven命令进行编译和测试。

## 7. dev-cli运行后端

根据 <u>**2. 相关链接**</u> 中的dev-cli工具地址拉取、配置并使用其运行上述生成的后端代码。

- standalone

> used to run target/pack-1.0.0-standalone.jar locally first change path into the mvn project and type 'standalone'

```shell
# 在相同目录下执行standalone指令
# 使用init参数则运行SQL文件进行初始化
$ standalone init
```
