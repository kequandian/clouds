## 如何修改列表项风格

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



## 如何增加列表项操作

#### 页面跳转
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

#### 执行API并提示确认
```
actions:
  -
```

## 如何配置详情页风格

#### 如何对重要信息进行加强显示
> 如何对编辑字段进行加粗, 改颜色，改字体大小处理
```
```



