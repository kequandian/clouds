#### crudless.yml配置步骤：

1、先通过GitHub   clone组件下来，目前需要用到的组件为“hub.crudless.zerocode”和“zero-json”（具体组件跟前端沟通）

2、然后通过参考文档或者让后端生成包含api的swagger.json文件，通过命令去生成yml文件，再根据具体需求来配置yml文件，生成yml命令有：

  先用swagger.json生成两个文件，命令如下：

      zero-json swagger format           #生成其中一个format文件

      zero-json swagger ls               #生成一个ls文件，所需api在这个文件找

  生成这两个文件后，通过命令在生成yml文件：

     zero-json swagger yaml test（最好与页面上的菜单字段一直） --API  /api/crud/advertingPlan/advertingPlans

3、根据已有模板去配置yml文件，配置完yml文件后，再次通过命令生成前端json文件，放到服务器上，具体命令如下：

    crudless --input ./yml --output ../abc/src/pages    #表示将当前文件夹下所有yml文件生成到abc文件夹目录下，目录可自定义

