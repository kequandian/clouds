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
