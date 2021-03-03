using Microsoft.SqlServer.Management.SqlParser.Parser;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using YamlDotNet.RepresentationModel;
using YamlDotNet.Serialization;

namespace Console
{
    class Program
    {
        static void Main(string[] args)
        {
            //var b = DoSome<StringBuilder>();
            //var s = DoSome<String>();

            //Console.WriteLine(DoSome<StringBuilder>());
            //Console.WriteLine(DoSome<String>());

            //Console.WriteLine(DoSome<DateTime>());
#if DEBUG
            args = new string[] { "cg-mysql-schema.sql", "cg_master_resource" };
#endif

            if (args == null || args.Length == 0)
            {
                System.Console.WriteLine("Usage: cli </path/to/schema.sql> [table-name]");
                return;
            }

            string schemaSql = args[0];
            string table_name = string.Empty;
            string crudlessYaml = string.Empty;

            if (args.Length==1)
            {
                // 仅有一个参数，默认全部表输出，输出路径为 <当前路径/yml>
                table_name = string.Empty;
                crudlessYaml = Directory.GetCurrentDirectory() + "/yml";
            }
            else if(args.Length==2)
            {
               string arg2 = args[1];
               if(arg2.EndsWith("yml") || arg2.Contains(Path.PathSeparator))
               {
                    //这是输出路径，不是表
                    crudlessYaml = arg2;
               }
               else
               {
                    //不以 yml 结束，说明这个是表名
                    table_name = arg2;
                    crudlessYaml = Directory.GetCurrentDirectory() + "/crudless.yml";
                }
            }
            else if(args.Length==3)
            {
                table_name  = args[1];
                crudlessYaml = args[2];
                if(!crudlessYaml.EndsWith(".yml")){
                    crudlessYaml = Path.Combine(crudlessYaml, "crudless.yml");
                }
            }

            ParseSQL(schemaSql, table_name, crudlessYaml);

#if DEBUG
            System.Console.Read();
#endif
        }

        public static void ParseSQL(string sqlFilePath, string tableName, string saveFilePath)
        {
            using (FileStream fileStream = new FileStream(sqlFilePath, FileMode.Open) )
            {
                string fileContents;
                using (StreamReader reader = new StreamReader(fileStream))
                {
                    fileContents = reader.ReadToEnd();
                }

                JArray crudlessJsonList = FieldFormat(fileContents);

                //判断文件夹是否存在
                // => 不一定是文件夹, 非文件而不存在则创建
                if( ! saveFilePath.EndsWith(".yml") && ! Directory.Exists(saveFilePath) ) //如果不存在就创建file文件夹
                {
                    Directory.CreateDirectory(saveFilePath);
                }

                if(!string.IsNullOrEmpty(tableName))
                {
                    string ymlJsonString = string.Empty;
                    string saveUrl = string.Empty;
                    MatchTableSaveYml(crudlessJsonList, tableName, saveFilePath, out ymlJsonString, out saveUrl);
                    if (ymlJsonString != string.Empty && saveUrl != string.Empty)
                    {
                        //tableName provided, just output crudless.yml
                        SaveYAMLFile(ymlJsonString, saveFilePath);
                    }
                    else
                    {
                        System.Console.WriteLine(string.Format("{0}匹配不到相应的sql", tableName));
                    }
                }
                else
                {
                    foreach (JObject item in crudlessJsonList)
                    {
                        string tn = item["tableName"].ToString();
                        string ymlJson = item["ymlJson"].ToString();

                        string saveUrl = string.Format("{0}/{1}.yml", saveFilePath, tn);

                        SaveYAMLFile(ymlJson, saveUrl);
                    }
                }
                //System.Console.WriteLine(pagesJO.ToString());

            }
        }


        #region Demo
        public static JObject ParseSQL(string Sql)
        {
            ParseOptions opt = new ParseOptions("GO");
            Scanner parser = new Scanner(opt);
            //string Sql = "SELECT * FROM dbo.History_b4 WHERE LOCATIONID ='B47F6EB7-D770-4A8B-AE06-9761B283A393' ORDER	 BY DateAdded desc OFFSET 1 ROWS FETCH NEXT 100 ROWS ONLY";
            // string Sql = "SELECT LOCATIONID, 'asdasda['LocationId']' FROM dbo.History_b4 WHERE order='adad' and LOCATIONID ='B47F6EB7-D770-4A8B-AE06-9761B283A393' ORDER	 BY DateAdded desc OFFSET 1 ROWS FETCH NEXT 100 ROWS ONLY";

            /*string Sql = @"select Id, 
                         JSON_QUERY([DocumentJson], '$.LocationId') AS LeadQue,  
                         JSON_VALUE([DocumentJson], '$.Lead') AS LocationId,   
                         JSON_VALUE([DocumentJson], '$.Orders[1].OrderID') AS OrderID, JSON_QUERY([DocumentJson] , '$.Orders[1]'), JSON_QUERY([DocumentJson], '$.Orders[1].Wasia')
                        from [PartitioningTests]
where AccountId='23123123123' AND LocationId =   'asdfdfasdfasdf' order by DateAdded
";*/

            parser.SetSource(Sql, 0);
            var token = Tokens.TOKEN_SET;
            int start = 0;
            int end = 0;
            int state = 0;
            bool isMatched = false;
            bool IsExecAutoParamHelp = false;

            bool isCreate = false;
            bool isNewFieldFlag = false;

            JObject obj = new JObject();
            JObject fieldObj = new JObject();
            JObject fieldChildObj = new JObject();

            string objName = string.Empty;
            string objFieldName = string.Empty;

            //记录每行第一，第二个 TOKEN_ID
            int count = 0;
            string fieldTypeName = string.Empty;
            bool isFieldTypeName = false;
            bool isDefault = false;
            bool closeTable = false;
            bool isPrimary = false;
            bool isUnique = false;

            while (token != Tokens.EOF)
            {
                int index = parser.GetNext(ref state, out start, out end, out isMatched, out IsExecAutoParamHelp);
                try
                {
                    token = (Tokens)index;

                    //System.Console.WriteLine($"{token} = {Sql.Substring(start, end - start + 1)}");

                    string valueData = Sql.Substring(start, end - start + 1);

                    if (token == Tokens.TOKEN_CREATE)
                    {
                        isCreate = true;
                    }

                    if (!isPrimary)
                    {
                        if (isCreate || isNewFieldFlag)
                        {

                            if (isCreate && !isNewFieldFlag && token == Tokens.TOKEN_ID)
                            {
                                objName = valueData;
                            }

                            //40 = 小括号
                            if (Convert.ToInt32(token) == 40)
                            {
                                isNewFieldFlag = true;
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_ID && count != -1)
                            {
                                count++;
                                if (count == 1)
                                {
                                    objFieldName = valueData;
                                }
                                else if (count == 2)
                                {
                                    count = -1;
                                    fieldChildObj = new JObject();
                                    fieldTypeName = valueData;
                                    isFieldTypeName = true;
                                }
                            }

                            if (isNewFieldFlag && fieldTypeName != string.Empty && isFieldTypeName && token == Tokens.TOKEN_INTEGER)
                            {
                                isFieldTypeName = false;
                                fieldChildObj.Add("dataType", string.Format("{0}:({1})", fieldTypeName, valueData));
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_NOT)
                            {
                                fieldChildObj.Add("notNull", "NOT NULL");
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_ID && valueData == "AUTO_INCREMENT")
                            {
                                fieldChildObj.Add("autoIncrement", true);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_DEFAULT)
                            {
                                isDefault = true;
                            }

                            if (isNewFieldFlag && isDefault && token == Tokens.TOKEN_INTEGER)
                            {
                                fieldChildObj.Add("default", valueData);
                            }
                            else if (isNewFieldFlag && isDefault && token == Tokens.TOKEN_NULL)
                            {
                                fieldChildObj.Add("default", valueData);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_UNIQUE)
                            {
                                fieldChildObj.Add("unique", valueData);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_STRING)
                            {
                                string newValue = valueData.Substring(1, valueData.Length - 2);
                                fieldChildObj.Add("comment", newValue);
                            }

                            if (Convert.ToInt32(token) == 44)
                            {
                                isCreate = false;
                                count = 0;
                                isDefault = false;
                                fieldObj.Add(objFieldName, fieldChildObj);
                            }

                        }
                    }

                    if (token == Tokens.TOKEN_PRIMARY)
                    {
                        isPrimary = true;
                        closeTable = true;
                    }

                    if (closeTable && token == Tokens.TOKEN_UNIQUE)
                    {
                        isUnique = true;
                    }

                    if (isUnique && token == Tokens.TOKEN_ID)
                    {
                        isUnique = false;
                        isPrimary = false;
                        closeTable = false;
                        JObject nJO = (JObject)fieldObj[valueData];
                        nJO.Add("unique", "UNIQUE");
                        fieldObj[valueData] = nJO;
                    }

                }
                catch (Exception ex)
                {
                    System.Console.WriteLine(ex.Message);
                }
            }

            obj.Add(objName, fieldObj);
            //System.Console.WriteLine(obj.ToString());
            return obj;
        }
        #endregion

        #region sql 转 json object
        public static JArray FieldFormat(string Sql)
        {
            ParseOptions opt = new ParseOptions("GO");
            Scanner parser = new Scanner(opt);
            //string Sql = "SELECT * FROM dbo.History_b4 WHERE LOCATIONID ='B47F6EB7-D770-4A8B-AE06-9761B283A393' ORDER	 BY DateAdded desc OFFSET 1 ROWS FETCH NEXT 100 ROWS ONLY";
            // string Sql = "SELECT LOCATIONID, 'asdasda['LocationId']' FROM dbo.History_b4 WHERE order='adad' and LOCATIONID ='B47F6EB7-D770-4A8B-AE06-9761B283A393' ORDER	 BY DateAdded desc OFFSET 1 ROWS FETCH NEXT 100 ROWS ONLY";

            /*string Sql = @"select Id, 
                         JSON_QUERY([DocumentJson], '$.LocationId') AS LeadQue,  
                         JSON_VALUE([DocumentJson], '$.Lead') AS LocationId,   
                         JSON_VALUE([DocumentJson], '$.Orders[1].OrderID') AS OrderID, JSON_QUERY([DocumentJson] , '$.Orders[1]'), JSON_QUERY([DocumentJson], '$.Orders[1].Wasia')
                        from [PartitioningTests]
where AccountId='23123123123' AND LocationId =   'asdfdfasdfasdf' order by DateAdded
";*/

            parser.SetSource(Sql, 0);
            var token = Tokens.TOKEN_SET;
            int start = 0;
            int end = 0;
            int state = 0;
            bool isMatched = false;
            bool IsExecAutoParamHelp = false;

            bool isCreate = false;
            bool isNewFieldFlag = false;

            JArray tableListJA = new JArray();

            JObject pagesJO = new JObject();
            JObject tableNameJO = new JObject();
            JObject obj = new JObject();
            JObject fieldObj = new JObject();
            JObject fieldChildObj = new JObject();

            JObject fChildSqlObj = new JObject();

            JObject viewPlainJO = new JObject();
            JArray viewPlainJArray = new JArray();
            JObject viewPlainItemJO = new JObject();
            JArray viewFieldJArray = new JArray();
            JObject viewFielditemJO = new JObject();

            //表名字
            string objName = string.Empty;
            //字段名
            string objFieldName = string.Empty;

            //记录每行第一，第二个 TOKEN_ID
            int count = 0;
            string fieldTypeName = string.Empty;
            bool isFieldTypeName = false;
            bool isDefault = false;
            bool closeTable = false;
            bool isPrimary = false;
            bool isUnique = false;

            while (token != Tokens.EOF)
            {
                int index = parser.GetNext(ref state, out start, out end, out isMatched, out IsExecAutoParamHelp);
                try
                {
                    token = (Tokens)index;

                    if( start + (end - start + 1) > Sql.Length)
                    {
                        //System.Console.WriteLine("Sql.Length=" + Sql.Length + "; start=" + start + "; end=" + end.ToString());
                        continue;
                    }

                    string valueData = Sql.Substring(start, end - start + 1);

                    if (token == Tokens.TOKEN_CREATE)
                    {
                        isCreate = true;
                    }

                    if (!isPrimary)
                    {
                        if (isCreate || isNewFieldFlag)
                        {

                            if (isCreate && !isNewFieldFlag && token == Tokens.TOKEN_ID)
                            {
                                objName = valueData;
                            }

                            //40 = 小括号
                            if (Convert.ToInt32(token) == 40)
                            {
                                isNewFieldFlag = true;
                                
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_ID && count != -1)
                            {
                                count++;
                                if (count == 1)
                                {
                                    objFieldName = valueData;
                                    if (objFieldName.Equals("id"))
                                    {
                                        //TODO 添加 搜索配置条件
                                    }
                                    else
                                    {
                                        viewFielditemJO = new JObject();
                                        viewFielditemJO.Add("label", "");
                                        viewFielditemJO.Add("field", objFieldName);
                                    }
                                }
                                else if (count == 2)
                                {
                                    count = -1;
                                    fieldChildObj = new JObject();
                                    fChildSqlObj = new JObject();
                                    fieldChildObj.Add("label", "");
                                    fieldChildObj.Add("type", "input");
                                    JObject props = new JObject();
                                    props.Add("placeholder", "请输入");
                                    fieldChildObj.Add("props", props);
                                    fieldTypeName = valueData;
                                    isFieldTypeName = true;
                                }
                            }

                            if (isNewFieldFlag && fieldTypeName != string.Empty && isFieldTypeName && token == Tokens.TOKEN_INTEGER)
                            {
                                isFieldTypeName = false;
                                string sqlTypeString = string.Format("{0}({1})", fieldTypeName, valueData);
                                fChildSqlObj.Add("type", sqlTypeString);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_NOT)
                            {
                                JObject rule = new JObject();
                                rule.Add("type", "required");
                                rule.Add("message", "请输入");
                                fieldChildObj.Add("rules", rule);
                                fChildSqlObj.Add("notnull", true);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_ID && valueData == "AUTO_INCREMENT")
                            {
                                //fieldChildObj.Add("autoIncrement", true);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_DEFAULT)
                            {
                                isDefault = true;
                            }

                            if (isNewFieldFlag && isDefault && token == Tokens.TOKEN_INTEGER)
                            {
                                fChildSqlObj.Add("default", valueData);
                            }
                            else if (isNewFieldFlag && isDefault && token == Tokens.TOKEN_NULL)
                            {
                                //fChildSqlObj.Add("default", valueData); 
                            }
                            else if (isNewFieldFlag && isDefault && token == Tokens.TOKEN_CURRENT_TIMESTAMP)
                            {
                                fChildSqlObj.Add("default", valueData);
                            }

                            if (isNewFieldFlag && token == Tokens.TOKEN_STRING)
                            {
                                string newValue = valueData.Substring(1, valueData.Length - 2);
                                fieldChildObj["label"] = newValue;
                                fChildSqlObj.Add("comment", newValue);

                                if (!objFieldName.Equals("id"))
                                {
                                    viewFielditemJO["label"] = newValue;
                                    viewFieldJArray.Add(viewFielditemJO);
                                }
                            }

                            if (Convert.ToInt32(token) == 44) //代码什么，需要注释, 可能是", "
                            {
                                isCreate = false;
                                count = 0;
                                isDefault = false;
                                if(!fieldChildObj.ContainsKey("scope"))
                                {
                                   fieldChildObj.Add("scope", new JArray("list", "view", "new", "edit"));
                                }
                                if(!fieldChildObj.ContainsKey("sql"))
                                {
                                   fieldChildObj.Add("sql", fChildSqlObj);
                                }
                                fieldObj.Add(objFieldName, fieldChildObj);
                            }

                        }
                    }

                    if (token == Tokens.TOKEN_PRIMARY)
                    {
                        isPrimary = true;
                        closeTable = true;
                    }

                    if (closeTable && token == Tokens.TOKEN_UNIQUE)
                    {
                        isUnique = true;
                    }

                    if (isUnique && token == Tokens.TOKEN_ID)
                    {
                        isUnique = false;
                        JObject nJO = (JObject)fieldObj[valueData];
                        JObject nSqlJO = (JObject)nJO["sql"];
                        nSqlJO.Add("unique", true);
                        nJO["sql"] = nSqlJO;
                        fieldObj[valueData] = nJO;
                    }

                    if(isPrimary && closeTable && !isUnique)
                    {
                        isPrimary = false;
                        closeTable = false;
                        isNewFieldFlag = false;

                        //yml固定结构
                        //obj.Add(objName, fieldObj);
                        string tableFileName = LineToHump(objName);
                        string apiUrlString = string.Format("/api/crud/{0}/{1}", tableFileName, tableFileName);
                        obj.Add("api", apiUrlString);
                        string pathUrl = string.Format("/{0}", tableFileName);
                        obj.Add("path", pathUrl);

                        #region title
                        JObject titleJO = new JObject();
                        titleJO.Add("table", "列表");
                        obj.Add("title", titleJO);
                        #endregion

                        #region layout
                        JObject layoutJO = new JObject();
                        layoutJO.Add("table", "Content");
                        layoutJO.Add("form", "TitleContent");
                        obj.Add("layout", layoutJO);
                        #endregion

                        #region form
                        JObject formJO = new JObject();
                        formJO.Add("columns", 1);
                        obj.Add("form", formJO);
                        #endregion

                        #region list
                        JObject searchJO = new JObject();

                        JObject searchFieldJO = new JObject();
                        JArray searchFieldList = new JArray();
                        JObject listItem = new JObject();
                        listItem.Add("label", "名字");
                        listItem.Add("field", "name");

                        JObject listItemProps = new JObject();
                        listItemProps.Add("placeholder", "请输入");
                        listItem.Add("props", listItemProps);
                        listItem.Add("type", "input");
                        searchFieldList.Add(listItem);
                        searchFieldJO.Add("fields", searchFieldList);
                        searchJO.Add("sreach", searchFieldJO);

                        obj.Add("list", searchJO);
                        #endregion

                        #region action
                        JArray actionsList = new JArray();
                        JObject actionsListItem;
                        actionsListItem = new JObject();
                        actionsListItem.Add("title", "新增");
                        actionsListItem.Add("type", "add");
                        actionsListItem.Add("style", "primary");
                        actionsListItem.Add("scope", "top");
                        actionsList.Add(actionsListItem);
                        actionsListItem = new JObject();
                        actionsListItem.Add("title", "编辑");
                        actionsListItem.Add("type", "edit");
                        actionsListItem.Add("outside", true);
                        actionsListItem.Add("scope", "item");
                        actionsList.Add(actionsListItem);
                        actionsListItem = new JObject();
                        actionsListItem.Add("title", "查看详情");
                        actionsListItem.Add("type", "view");
                        actionsListItem.Add("outside", true);
                        actionsListItem.Add("scope", "item");
                        actionsList.Add(actionsListItem);

                        actionsListItem = new JObject();
                        actionsListItem.Add("title", "删除");
                        actionsListItem.Add("type", "request");
                        actionsListItem.Add("tips", "确定要删除吗?");
                        actionsListItem.Add("method", "delete");

                        string deleteApiUrl = string.Format("{0}/(id)", apiUrlString);
                        actionsListItem.Add("api", deleteApiUrl);
                        //actionsListItem.Add("scope", "item");
                        actionsList.Add(actionsListItem);

                        obj.Add("actions", actionsList);
                        #endregion

                        #region view
                        viewPlainItemJO.Add("title", "基本信息");
                        viewPlainItemJO.Add("type", "plain");
                        viewPlainItemJO.Add("fields", viewFieldJArray);
                        viewPlainJArray.Add(viewPlainItemJO);
                        viewPlainJO.Add("left", viewPlainJArray);
                        obj.Add("view", viewPlainJO);
                        #endregion

                        //fields
                        obj.Add("fields", fieldObj);

                        tableNameJO.Add(tableFileName, obj);

                        pagesJO.Add("pages", tableNameJO);

                        JObject tableData = new JObject();
                        tableData.Add("tableName", objName);
                        tableData.Add("ymlJson", pagesJO);

                        tableListJA.Add(tableData);

                        //初始化
                        pagesJO = new JObject();
                        tableNameJO = new JObject();
                        obj = new JObject();
                        fieldObj = new JObject();
                        fieldChildObj = new JObject();

                        fChildSqlObj = new JObject();

                        viewPlainJO = new JObject();
                        viewPlainJArray = new JArray();
                        viewPlainItemJO = new JObject();
                        viewFieldJArray = new JArray();
                        viewFielditemJO = new JObject();
                    }

                }
                catch (Exception ex)
                {
                    System.Console.WriteLine(ex.Message);
                }
            }
            
            return tableListJA;
        }
        #endregion

        #region 匹配外部传进来的table name
        public static void MatchTableSaveYml(JArray crudlessJsonList, string tableName, string saveFilePath,
            out string ymlJsonString, out string saveUrl)
        {
            string yjs = string.Empty;
            string su = string.Empty;
            foreach (JObject item in crudlessJsonList)
            {
                string tn = item["tableName"].ToString();
                if (tn.Equals(tableName))
                {
                    yjs = item["ymlJson"].ToString();
                    su = string.Format("{0}/{1}.yml", saveFilePath, tn);
                    break;
                }
            }
            ymlJsonString = yjs;
            saveUrl = su;
        }
        #endregion

        public static T DoSome<T>()
        {
            if (typeof(T) == typeof(StringBuilder))
            {
                var a = new StringBuilder();
                a.Append("asdasd");
                //return (T)Convert.ChangeType(a, typeof(T));
                return (T)(object)a;
            }

            if (typeof(T) == typeof(String))
            {
                var a = "Hello world";
                return (T)Convert.ChangeType(a, typeof(T));
            }

            return (T)Convert.ChangeType(default(T), typeof(T));
        }

        #region
        public static string LineToHump(string value)
        {
            StringBuilder builder = new StringBuilder();
            foreach (var s in value.Split(new[] { '_' }, StringSplitOptions.RemoveEmptyEntries))
            {
                builder.Append(Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(s));
            }
            string str = builder.ToString().First().ToString().ToLower() + builder.ToString().Substring(1);
            return str;
        }
        #endregion

        #region 保存为yml文件
        public static void SaveYAMLFile(string jsonString, string savePathFile)
        {
            var expConverter = new ExpandoObjectConverter();
            dynamic deserializedObject = JsonConvert.DeserializeObject<ExpandoObject>(jsonString, expConverter);

            var serializer = new YamlDotNet.Serialization.Serializer();
            string yaml = serializer.Serialize(deserializedObject);
            //System.Console.WriteLine(yaml);

            //文件路劲
            //String savePath = Directory.GetCurrentDirectory() + @"\category.yml";

            //将数据保存到YAML文件
            using (System.IO.StreamWriter file = new System.IO.StreamWriter(savePathFile, false, Encoding.GetEncoding("utf-8")))
            {
                file.Write(yaml);
                file.Close();
            }
        }
        #endregion
    }

    class TestClass : ITest1, ITest2
    {
        public string Name1
        {
            get
            {
                return "Name1";
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public string Name2
        {
            get
            {
                return "Name2";
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public void Test1()
        {
            System.Console.WriteLine("Test1");
        }

        public void Test2()
        {
            System.Console.WriteLine("Test2");
        }
    }
    interface ITest1
    {
        void Test1();
        string Name1 { get; set; }
    }

    interface ITest2
    {
        void Test2();
        string Name2 { get; set; }
    }
}
