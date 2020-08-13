# CrudlessHub

`云应用**无CRUD服务**定义编排中心`

## 通过编排文件 crudless.yml 定义应用

直接基于业务理解定义应用服务，各实体单元包括列表以详情字段，还可以自动构建数据库sql, 自动生成API代码

[编排定义源文件(crudless.yml)](crudless.yml)

# 将编排文件生成为 `BUILD JSON`

```bash
$ npm install -g
$ crudless  
outPath:  ./issue.json
outSQLPath:  ./crudless.sql
$ crudless -h
crudless  ## 默认找同目录的 crudless.yml，并且默认输出前后端配置文件
crudless -f /path/to/crudless.yml  ## 指定文件并输出所有配置文件
crudless -f /path/to/crudless.yml --json --sql --crud  ## 按不同参数输出相应配置文件
```

## TODO

> - 字段的编排细节（基于 zero-json 考虑）
> - 单页是否独立文件，不然独立的编排文件太大
> - 分类管理编排
> - 关于一对多的关系编排

>   - 数据库主表与从表之间字段关联
>   - 实体详情一对多数据展示

> - 对编排与生成代码之间的维护

>   - 是否覆盖生成的代码
>   - 自动生成代码被手工修改后 的处理方案（待确定）
