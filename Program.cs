using Microsoft.SqlServer.Management.SqlParser.Parser;
using System;
using System.IO;
using System.Linq;
using System.Text;

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
            FileStream fileStream = new FileStream("cg-mysql-schema.sql", FileMode.Open);
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

            while (token != Tokens.EOF)
            {
                int index = parser.GetNext(ref state, out start, out end, out isMatched, out IsExecAutoParamHelp);
                try
                {
                    token = (Tokens)index;
                    System.Console.WriteLine($"{token} = {Sql.Substring(start, end - start + 1)}");

                    //Console.WriteLine(token);
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine(ex.Message);
                }
            }
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
