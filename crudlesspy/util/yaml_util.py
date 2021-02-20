import pymysql
import yaml

show_tables_sql = 'show tables'
desc_tables_sql = "select COLUMN_NAME,COLUMN_KEY,COLUMN_TYPE,COLUMN_DEFAULT,IS_NULLABLE,COLUMN_COMMENT from information_schema.columns where table_schema = '%s' and table_name = '%s'"
fields = {}
yml = {'pages': {}}
page = {
    'form': {'column': 2}, 'list': {
        'search': {'fields': [{'label': '搜索', 'field': 'search', 'type': 'input'}],
                   'actions': [{'title': '新建', 'type': 'add', 'scope': 'top'},
                               {'title': '详情', 'type': 'view', 'outside': 'true'},
                               {'title': '编辑', 'type': 'edit', 'outside': 'false'},
                               {'title': '删除', 'type': 'delete', 'outside': 'false'}]}},
    'fields': fields,
}


def get_connection(host, port, username, password, database):
    connection = pymysql.Connect(host=host, port=port,
                                 user=username, passwd=password,
                                 db=database, charset="utf8")
    connection.autocommit(True)
    return connection


def collect_yaml(host, port, username, password, database, table_name, module_name):
    connection = get_connection(host, port, username, password, database)
    cursor = connection.cursor()
    desc_table = desc_tables_sql % (database, table_name)
    # 生成page中的api属性
    page['api'] = '/api/crud/' + module_name + '/' + module_name + 's'
    # 构建pages -> page_name -> fields
    yml['pages'][table_name] = page
    fields[table_name] = []
    cursor.execute(desc_table)
    for r in cursor.fetchall():
        sql = {
            'type': r[2],
            'comment': r[5]
        }
        if r[1] == 'PRI':
            sql['unique'] = True
        elif r[4] == 'NO':
            sql['notnull'] = True
        elif not r[3] is None:
            sql['default'] = r[3]
        field = {r[0]: {'sql': sql, 'label': r[5], 'type': 'input', 'props': {'placeholder': '请输入'},
                        'rules': {'type': 'required', 'message': '请输入'},
                        'scope': ['list', 'view', 'new', 'edit']}}
        fields[table_name].append(field)


def collect_all_yaml(host, port, username, password, database, module_name):
    connection = get_connection(host, port, username, password, database)
    cursor = connection.cursor()  # 获取游标
    cursor.execute(show_tables_sql)  # 查询数据库的表
    for each in cursor.fetchall():
        collect_yaml(host, port, username, password, database, each[0], module_name)


def write_yaml(host, port, username, password, database, table_name, module_name):
    collect_yaml(host, port, username, password, database,
                 table_name, module_name) if table_name else collect_all_yaml(host, port,
                                                                              username, password,
                                                                              database, module_name)
    return yaml.dump(yml, allow_unicode=True)
