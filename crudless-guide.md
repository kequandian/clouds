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
  - 
```

#### 执行API并提示确认
```
actions:
  -
```
