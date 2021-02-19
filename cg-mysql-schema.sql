SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `cg_master_resource_category`;
CREATE TABLE `cg_master_resource_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `org_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '数据隔离组织id',
  `org_tag` varchar(100) DEFAULT NULL COMMENT '组织标识',
  `pid` varchar(100) NOT NULL COMMENT '父节点',
  `name` varchar(100) NOT NULL COMMENT '名字',
  `field` varchar(100) DEFAULT NULL COMMENT '分组标识字段',
  `description` varchar(200) DEFAULT NULL COMMENT '说明',
  PRIMARY KEY (`id`),
  UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cg_master_resource`;
CREATE TABLE `cg_master_resource` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `org_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '数据隔离组织id',
  `org_tag` varchar(100) DEFAULT NULL COMMENT '组织标识',
  `name` varchar(100) NOT NULL COMMENT '资源名字',
  `status` varchar(26) NOT NULL COMMENT '状态[OPEN,SUBMITTED,APPROVED,REJECTED,CLOSED]',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `category_id` bigint(20) DEFAULT NULL COMMENT '资源分类关联ID',
  `user_id` bigint(20) DEFAULT 0 COMMENT '资源归属用户',
  `owner_id` bigint(20) DEFAULT 0 COMMENT '资源归属用户或用[owner_id]',
  `code` varchar(100) DEFAULT NULL COMMENT '资源唯一编号',
  `title` varchar(100) DEFAULT NULL COMMENT '资源标题',
  `registered_time` datetime DEFAULT NULL COMMENT '注册时间',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `closed_time` datetime DEFAULT NULL COMMENT '关闭时间',
  `expired_time` datetime DEFAULT NULL COMMENT '过期时间',
  `appointed_time` datetime DEFAULT NULL COMMENT '预约时间',
  `invalid` smallint DEFAULT 0 COMMENT '是否无效',
  `description` varchar(200) DEFAULT NULL COMMENT '说明',
  `note` text DEFAULT NULL COMMENT '备注',
  `sort_num` int(10)  DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cg_master_resource_item`;
CREATE TABLE `cg_master_resource_item` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` varchar(100) NOT NULL COMMENT '名字',
  `master_id` bigint(20) NOT NULL COMMENT '主体ID',
  `master_field` varchar(100) DEFAULT NULL COMMENT '关联主体字段',
  `title` varchar(100) DEFAULT NULL COMMENT '标题',
  `amount` int DEFAULT NULL COMMENT '数量',
  `price` DECIMAL(10,2) DEFAULT NULL COMMENT '价格',
  `color` varchar(26) DEFAULT NULL COMMENT '颜色',
  `size` varchar(26) DEFAULT NULL COMMENT '尺寸',
  `description` varchar(200) DEFAULT NULL COMMENT '说明',
  `invalid` smallint DEFAULT 0 COMMENT '是否无效',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cg_master_resource_record`;
CREATE TABLE `cg_master_resource_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` varchar(100) NOT NULL COMMENT '名字',
  `other_id` bigint(20) NOT NULL COMMENT '主体ID',
  `master_field` varchar(100) DEFAULT NULL COMMENT '关联主体字段',
  `title` varchar(100) DEFAULT NULL COMMENT '标题',
  `description` varchar(200) DEFAULT NULL COMMENT '说明',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cg_master_resource_peer`;
CREATE TABLE `cg_master_resource_peer` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `org_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '数据隔离组织id',
  `org_tag` varchar(100) DEFAULT NULL COMMENT '组织标识',
  `name` varchar(100) NOT NULL COMMENT '资源名字',
  `status` varchar(26) NOT NULL COMMENT '状态[OPEN,SUBMITTED,APPROVED,REJECTED,CLOSED]',
  `user_id` bigint(20) DEFAULT 0 COMMENT '资源归属用户',
  `title` varchar(100) DEFAULT NULL COMMENT '资源标题',
  `category_group` varchar(50) DEFAULT NULL COMMENT '资源分类归属分组',
  `category_id` bigint(20) DEFAULT NULL COMMENT '资源分类ID',
  `description` varchar(200) DEFAULT NULL COMMENT '资源说明',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cg_master_resource_relation`;
CREATE TABLE `cg_master_resource_relation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `master_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '主资源ID',
  `master_peer_id` bigint(20) DEFAULT 0 COMMENT '多对多主资源ID',
  `flag` int DEFAULT NULL COMMENT '关系标记',
  `description` varchar(200) DEFAULT NULL COMMENT '关系说明',
  PRIMARY KEY (id),
  UNIQUE (`master_id`,`master_peer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

