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
                File.WriteAllText("sources.json", json);
            }).Wait();
        }
    }
}