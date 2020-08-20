# cruds.json

>**Tips：采用JSONArray格式进行对应存储。**

## 0. 字段说明

| **Field Name** |        one         |      onemany       |       group        |      groupby       | **Description**                                              |
| :------------- | :----------------: | :----------------: | :----------------: | :----------------: | ------------------------------------------------------------ |
| mask           | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | **结构 *（表-表）* 模式标识**：one *（单表结构）* 、onemany *（一对多结构）* 、manymany *（多对多结构）* 、group *（仅建分组表）* 、groupby *（依据某表建立分组表）*  |
| master         | :heavy_check_mark: | :heavy_check_mark: |                    |                    | **主数据表名称**                                             |
| master_id      |                    | :heavy_check_mark: |                    |                    | 子表关联主表所需要的**关联ID字段**                           |
| slaves         |                    | :heavy_check_mark: |                    |                    | **从表集合**，其下包含的为多个关联子表名称，如：`"slaves"：["t_1","t_2",...,"t_n"]` |
| group          |                    |                    | :heavy_check_mark: | :heavy_check_mark: | **分组表名称**                                               |
| groupBy        |                    |                    |                    | :heavy_check_mark: | **被分组的表名称**                                           |
| groupId        |                    |                    |                    | :heavy_check_mark: | **对应被分组表ID字段** *（需确保准确对应被分组表的ID）*      |

>**Tips：​标识:heavy_check_mark:表示在该模式下必须存在该字段。**

- **one**：单表关系
- **onemany**：一对多关系
- **manymany**：多对多关系
- **group**：仅建立分组表
- **groupBy**：根据某表建立分组表

## 1. 单表（one）

### JSON

```json
[
    {
        "mask":"one",
        "master": "t_test"
    }
]
```

### 解析


| **表关系**                 | **表名**                                      |
| -------------------------- | --------------------------------------------- |
| 单表 *（对应`mask：one`）* | t_test *（对应`"master": "t_test"`）* |

## 2. 一对多（oneTomany）

### JSON

```json
[
    {
        "mask": "onemany",
        "master": "cg_master_resource",
        "masterId": "master_id;other_id",
        "slaves": [
            "cg_master_resource_item",
            "cg_master_resource_record"
        ]
    }
]
```

### 解析

| **表关系** | **主表名称**       | **各从表对应主表ID字段** | **从表1名称**           | **从表2名称**             |
| ---------- | ------------------ | ---------------------- | ----------------------- | ------------------------- |
| 一对多     | cg_master_resource | master_id;other_id     | cg_master_resource_item | cg_master_resource_record |



## 3. 多对多（manyTomany）

>**TODO：待确定**

## 4. 分组

### 4.1 group

#### JSON

```json
[
    {
        "mask":"group",
        "group":"cg_master_resource_category"
    }
]
```

#### 解析

| **表关系** | **表名称**                  |
| ---------- | --------------------------- |
| 分组       | cg_master_resource_category |

### 4.2 groupBy

#### JSON

```json
[
    {
        "mask":"groupby",
        "group":"cg_master_resource_category",
        "groupBy":"cg_master_resource",
        "groupId":"category_id"
    }
]
```

#### 解析

| **表关系** | **分组表名称**              | **被分组表名称**   | **被分组表ID** |
| ---------- | --------------------------- | ------------------ | -------------- |
| 分组       | cg_master_resource_category | cg_master_resource | category_id    |

