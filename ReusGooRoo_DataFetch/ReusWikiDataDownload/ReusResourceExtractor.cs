using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;
using ReusWikiDataDownload.GameClasses;

namespace ReusWikiDataDownload
{
    public class ReusResourceExtractor
    {
        private class PageWithTransmutations
        {
            public HtmlNode Page { get; set; }
            public string Transmutations { get; set; }
        }

        private static readonly string[] ValidBiomes = { "Desert", "Ocean", "Mountain", "Forest", "Swamp" };

        private readonly ReusWikiPageDownloader _reusWikiPageDownloader;

        public ReusResourceExtractor(ReusWikiPageDownloader reusWikiPageDownloader)
        {
            _reusWikiPageDownloader = reusWikiPageDownloader;
        }

        public async Task<IEnumerable<Resource>> GetReusResources()
        {
            var sw = Stopwatch.StartNew();

            // Fetch the page.
            HtmlNode wholePage = await _reusWikiPageDownloader.GetPage("/index.php?title=Natural_Sources");
            var resources = wholePage
                // Iterate the separate biome tables (they should contain all natural sources).
                .SelectNodes("//table[contains(@class,'wikitable')]/tr[position() > 1]")
                // For each table find the link to the page containing description of the natural source.
                .Select(
                    tableRow => new
                    {
                        link = tableRow.SelectSingleNode("./td[1]/a[2]").Attributes["href"].Value,
                        transmutations = tableRow.SelectSingleNode("./td[5]").InnerText
                    })
                //.Where(u => u.link.Contains("Stone"))
                // Fetch the page.
                .Select(async resourceUrl => new PageWithTransmutations
                {
                    Page = await _reusWikiPageDownloader.GetPage(resourceUrl.link + "&action=edit"),
                    Transmutations = resourceUrl.transmutations
                })
                .AsParallel().WithDegreeOfParallelism(5)
                // Convert the page to a resource description.
                .Select(async resourcePage => TryGetResourceDescription((await resourcePage)));
            //.Take(50);

            // Wait for all resources to be fetched.
            Resource[] result = await Task.WhenAll(resources);
            Console.WriteLine(sw.Elapsed);
            return result;
        }

        private static Resource TryGetResourceDescription(PageWithTransmutations pageWithTransmutations)
        {
            try
            {
                return GetResourceDescription(pageWithTransmutations);
            }
            catch (Exception)
            {
                Console.WriteLine("Error during page parsing.");
                return null;
            }
        }

        private static Resource GetResourceDescription(PageWithTransmutations pageWithTransmutations)
        {
            var resource = new Resource
            {
                // Get the name.
                Name =
                    pageWithTransmutations.Page.SelectSingleNode(
                        "//div[@id='contentSub']/a[contains(@href,'/index.php?title=')]").Attributes["title"].Value
            };

            Console.WriteLine($"Getting {resource.Name}.");

            resource.Transmutations = Transmutation.GetByDescription(pageWithTransmutations.Transmutations);

            string markupText = pageWithTransmutations.Page.SelectSingleNode(".//textarea").InnerHtml;

            // Find the family.
            resource.Family = Regex.Match(markupText, "data3.+=(.+)").Groups[1].Value.Trim().Trim(']', '[');
            // And the biome.
            // Possible raw biome data example: [[Forest]], [[Mountain]], [[Desert]]
            string rawBiome = Regex.Match(markupText, "data2.+=(.+)").Groups[1].Value.Trim();
            resource.Biomes = Regex.Matches(rawBiome, @"\[\[(.+?)\]\]").Cast<Match>().Select(match => match.Groups[1].Value).ToArray();
            if (resource.Biomes.Any(biome => !ValidBiomes.Contains(biome)))
            {
                throw new Exception("One of the biomes has invalid name: " + String.Join(",", resource.Biomes));
            }

            var region = GetWikiRegion(markupText, "Levels");

            region = Regex.Replace(region, @"\n{{", "{{", RegexOptions.Multiline);
            region = Regex.Replace(region, @"^(\w*)\|(\w*)", "$1$2", RegexOptions.Multiline);
            region = region.Replace("{{", "");
            region = region.Replace("}}", "");
            region = Regex.Replace(region, @"\n''", "''", RegexOptions.Multiline);
            region = Regex.Replace(region, @"\n\*", "*", RegexOptions.Multiline);

            // Create dictionaries, each one should contain details of a concrete level of the Natural Source we are analyzing.
            IEnumerable<Dictionary<string, string>> sourceDescriptions =
                // Find the blocks of NaturalSource(s)
                Regex.Matches(region, "NaturalSource(.*?)\n(\n|$)", RegexOptions.Singleline)
                .Cast<Match>()
                // Select the first match (should be the actual block of data)
                .Select(match => match.Groups[1].Value.Trim())
                // Convert the data to a dictionary.
                .Select(data =>
                    data
                        .Split('\n')
                        // This trash entry was a problem :)
                        .Where(e => e.Trim() != "''none''")
                        // Split entries by the equal sign (each line now shoul be "aa = bb")
                        .Select(l => l.Split('='))
                        .ToDictionary(key => key[0].Trim(), value => value[1].Trim()));

            foreach (Dictionary<string, string> sourceDetails in sourceDescriptions)
            {
                List<Symbiosis> symbioses =
                    // Get the symbioses descriptions
                    GetValuesByKeysWithNumbers(sourceDetails, "symbiosis")
                    // Split them, there are sometimes two descriptions in one line. The dot should be an end of each sentence.
                    .SelectMany(descriptions => descriptions.Split(new[] { "." }, StringSplitOptions.RemoveEmptyEntries))
                    // Create a detailed symbiosis object for each entry we found.
                    .Select(description => new Symbiosis { Description = description }.Analyze()).ToList();

                // Resources are in the dictionary as an entry with any of the below keys.
                string[] resourceKeys = { "food", "natura", "awe", "technology", "wealth", "range" };
                Yield[] yields =
                    sourceDetails
                        .Where(d => resourceKeys.Contains(d.Key))
                        .Select(d => new Yield { Name = d.Key, Amount = int.Parse(d.Value) })
                        .ToArray();

                resource.Levels.Add(new ResourceLevel
                {
                    Name = sourceDetails["name"].Trim(),
                    MaxAspects = int.Parse(sourceDetails["aspects"]),
                    Symbioses = symbioses,
                    Yields = yields,
                    ResourcePrerequisite = sourceDetails.ContainsKey("activates") ? sourceDetails["activates"] : null,
                    Level = int.Parse(sourceDetails["level"])
                });
            }

            // Too few abilities returned this way.
            //var tech = GetWikiRegion(markupText, "Tech Path");
            //Match abilityNeededMatch = Regex.Matches(tech, "'''(.*?)''': (.*?)$", RegexOptions.Multiline).Cast<Match>().FirstOrDefault();
            //if (abilityNeededMatch != null)
            //{
            //    resource.AbilityNeeded = Ability.NameFromDescription(abilityNeededMatch.Groups[2].Value);
            //}

            return resource;
        }

        private static string GetWikiRegion(string markup, string regionName)
        {
            return Regex.Match(markup, $@"=={regionName}==(.*?)(^=|\Z)", RegexOptions.Singleline | RegexOptions.Singleline).Groups[1].Value;
        }

        private static List<TValue> GetValuesByKeysWithNumbers<TValue>(Dictionary<string, TValue> dictionary, string keyName, int maxEntriesCount = 10)
        {
            var result = new List<TValue>();
            for (int i = 1; i < maxEntriesCount; i++)
            {
                string key = keyName + i;
                if (!dictionary.ContainsKey(key))
                    break;

                result.Add(dictionary[key]);
            }
            return result;
        }
    }
}