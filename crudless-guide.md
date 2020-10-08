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
```

#### 如何配置列表项操作执行页面跳转
```
actions:
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



