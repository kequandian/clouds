using Microsoft.SqlServer.Management.SqlParser.Parser;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Linq;
using System.Text;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

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

            ParseSQL();


            System.Console.Read();
        }

        public static void ParseSQL()
        {
            StringBuilder builder = new StringBuilder();
            FileStream fileStream = new FileStream("category.sql", FileMode.Open);
            using (StreamReader reader = new StreamReader(fileStream))
            {
                string line = string.Empty;
                while ( (line = reader.ReadLine()) != null)
                {
                    builder.Append(line);
                }
            }
            ParseSQL(builder.ToString());
        }

        public static void ParseSQL(string Sql)
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

                    if(!isPrimary)
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

                            if(isNewFieldFlag && token == Tokens.TOKEN_DEFAULT)
                            {
                                isDefault = true;
                            }

                            if(isNewFieldFlag && isDefault && token == Tokens.TOKEN_INTEGER)
                            {
                                fieldChildObj.Add("default", valueData);
                            }
                            else if (isNewFieldFlag && isDefault && token == Tokens.TOKEN_NULL)
                            {
                                fieldChildObj.Add("default", valueData);
                            }

                            if(isNewFieldFlag && token == Tokens.TOKEN_UNIQUE)
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

                    if (closeTable && token == Tokens.TOKEN_UNIQUE )
                    {
                        isUnique = true;
                    }

                    if(isUnique && token == Tokens.TOKEN_ID)
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
            System.Console.WriteLine(obj.ToString());
        }

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
