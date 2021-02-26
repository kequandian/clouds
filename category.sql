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
