import mysql.connector


# 根据sql_path文件导入数据表至数据库中
def import_sql(sql_path, db_info):
    file = open(sql_path)
    sql = file.read()

    cnx = mysql.connector.connect(user=db_info['username'], password=db_info['password'],
                                  host=db_info['host'], database=db_info['database'])
    cursor = cnx.cursor()
    for result in cursor.execute(sql, multi=True):
        if result.with_rows:
            print("Rows produced by statement '{}':".format(
                result.statement))
            print(result.fetchall())
        else:
            print("Number of rows affected by statement '{}': {}".format(
                result.statement, result.rowcount))
    cnx.close()


def cleanup_db(db_info):
    cnx = mysql.connector.connect(user=db_info['username'], password=db_info['password'],
                                  host=db_info['host'], database=db_info['database'])
    cursor = cnx.cursor()
    cursor.execute("drop database " + db_info['database'])
    cursor.execute("create database " + db_info['database'])
    cnx.close()
