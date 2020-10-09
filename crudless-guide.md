## 如何配置列表

#### 如何对列表项进行加粗显示、灰度处理
```
prices:
  label: 单价
  type: complex
  options:
    fields:
      - field: price
        type: currency
        options:
          style:
            fontWeight: 900      
      - field: retailPrice
        type: currency
        options:
          symbol: "刊例价: ￥"
          style:
            color: "#888"       
    direction: vertical
  scope:
    - list
```

#### 如何配置列表项字段进行页面跳转
```
 planNumber:
        label: 计划单号
        type: complex        
        options:
          fields:
            - field: planNumber
              type: path      #页面跳转的类型配置为：path
              options:
                path: "/advertismanage/advertingPlan/advertingPlan-view"    #  跳转到页面的api        
                query:
                  id: planId     #跳转到页面对应的id字段
        scope:
          - list
          - view
```

#### 如何配置列表项操作执行页面跳转
```
actions:
  - title: 创建计划
    type: path #path为页面跳转类型
    outside: true
    path: /advertismanage/advertingPlan/advertingPlan-help #跳转到的页面路径
    query:
      advertiserId: id #跳转到指定页面需要传递的id
    scope: item
  - 
```

#### 如何配置列表项操作执行API
```
actions:
  -
```

## 如何配置详情页风格

#### 如何对重要信息进行加强显示
> 如何对编辑字段进行加粗, 改颜色，改字体大小处理
```
```



