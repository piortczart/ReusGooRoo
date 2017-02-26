using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using ReusWikiDataDownload.GameClasses;

namespace ReusWikiDataDownload
{
    partial class Program
    {

        static void Main()
        {
            Task.Run(async () =>
            {
                var parser = new ReusResourceExtractor(new ReusWikiPageDownloader());
                IEnumerable<Resource> resources = await parser.GetReusResources();
                var json = new JavaScriptSerializer().Serialize(resources);
                var outputFileInfo = new FileInfo("sources.json");
                Console.WriteLine("Storing the result in: " + outputFileInfo.FullName);
                File.WriteAllText(outputFileInfo.FullName, json);
            }).Wait();
        }
    }
}