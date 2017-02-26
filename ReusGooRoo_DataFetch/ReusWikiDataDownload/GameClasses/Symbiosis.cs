using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace ReusWikiDataDownload.GameClasses
{
    public class Symbiosis
    {
        public string Description { get; set; }

        public string Type { get; set; }
        public string[] OtherSource { get; set; }
        public Yield[] Benefits { get; set; }

        private static IEnumerable<string> GetResourceNames(string resouceMeta, bool returnSimpleNames = true)
        {
            var matches = Regex.Matches(resouceMeta, @"\[\[(.*?)\]\]").Cast<Match>();
            var matchesSplit = matches.Select(m => m.Groups[1].Value.Split('|'));

            // The first name will be returned for each match.
            if (returnSimpleNames)
                return matchesSplit.Select(x => x[0]);

            // The second name will be returned for each match (if available).
            return matchesSplit.Select(x => x.Length > 1 ? x[1] : x[0]);
        }


        public Symbiosis Analyze()
        {
            var cleanDescription = Regex.Replace(Description, @"''.*?'':\s", "");

            string benefitMeta = null;
            if (cleanDescription.Contains("if next to"))
            {
                //Food|+10 if next to an [[Apple Tree]], [[Dandelion]] or [[Strawberry]].
                var tt = cleanDescription.Split(new[] { "if next to" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "ifNextTo";
            }
            else if (cleanDescription.Contains("for each") && cleanDescription.Contains("next to it"))
            {
                //Food|+16 and Natura|+4 for each [[Animals|Animal Nest]] next to it.
                var tt = cleanDescription.Split(new[] { "for each" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "forEachNextToIt";
            }
            else if (cleanDescription.Contains("for each") && cleanDescription.Contains("next to this"))
            {
                //Technology|+50 and Wealth|+50 but Awe|-15 for each [[Plants|Plant]] next to this Opium Poppy.
                var tt = cleanDescription.Split(new[] { "for each" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "forEachNextToIt";
            }
            else if (cleanDescription.Contains("for each Natura") && cleanDescription.Contains("on this"))
            {
                //Food|+3 for each Natura on this patch
                var tt = cleanDescription.Split(new[] { "for each Natura" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = new[] { "natura" };
                Type = "forEachOnThis";
            }
            else if (cleanDescription.Contains("for each") && cleanDescription.Contains("on this"))
            {
                //Wealth|+2 for each Danger|1 on this patch.
                var tt = cleanDescription.Split(new[] { "for each" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "forEachOnThis";
            }
            else if (cleanDescription.Contains("for each") && cleanDescription.Contains("within Natura"))
            {
                //Food|+15 for each [[Minerals|Mineral]] within Natura Range.
                var tt = cleanDescription.Split(new[] { "for each" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "forEachWithinNatura";
            }
            else if (cleanDescription.Contains("if there is a") && cleanDescription.Contains("within natura"))
            {
                //food|+80 and natura|+25 if there is a [[minerals|mineral]] within natura range
                var tt = cleanDescription.Split(new[] { "if there is a" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "ifSourceWithinNatura";
            }
            else if (cleanDescription.Contains("if there is a") && cleanDescription.Contains("within Animal-Range"))
            {
                //Wealth|+2 if there is a [[Mineral]] within Animal-Range
                var tt = cleanDescription.Split(new[] { "if there is a" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "ifSourceWithinRange";
            }
            else if (cleanDescription.Contains("if a") && cleanDescription.Contains("is within Animal-Range"))
            {
                //Food|+3 if a [[Blueberry]] is within Animal-Range
                var tt = cleanDescription.Split(new[] { "if a" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "ifSourceWithinRange";
            }
            else if (cleanDescription.Contains("if there is no") && cleanDescription.Contains("within Animal-Range"))
            {
                // Food|+15 if there is no [[Boar]], [[Wolf]] or [[Wisent]] within Animal-Range.
                var tt = cleanDescription.Split(new[] { "if there is no" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "ifNotWithinRange";
            }
            else if (cleanDescription.Contains("if there is no other") && cleanDescription.Contains("within Natura"))
            {
                //Natura|+12 and Food| +20 if there is no other [[Plants | Plant]] within Natura Range
                var tt = cleanDescription.Split(new[] { "if there is no other" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "ifNoOtherWithinNatura";
            }
            else if (cleanDescription.Contains("if another") && cleanDescription.Contains("within Animal-Range"))
            {
                //Food|+5 if another[[Rabbit]] is within Animal-Range
                var tt = cleanDescription.Split(new[] { "if there is no other" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                Type = "ifAnotherWithinRange";
            }
            else if (cleanDescription.Contains("for each") && cleanDescription.Contains("within Animal-Range") && !cleanDescription.Contains("with at least"))
            {
                ////Food|+3 for each [[Deer]], [[Wisent]] or [[Boar]] within Animal-Range
                var tt = cleanDescription.Split(new[] { "for each" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "forEachWithinRange";
            }
            else if (cleanDescription.Contains("for each") && cleanDescription.Contains("in Animal-Range") && !cleanDescription.Contains("with at least"))
            {
                //Food|+5 for each [[Mineral]] in Animal-Range.
                var tt = cleanDescription.Split(new[] { "for each" }, StringSplitOptions.None);
                benefitMeta = tt[0];
                OtherSource = GetResourceNames(tt[1]).ToArray();
                Type = "forEachWithinRange";
            }
            else if (cleanDescription.StartsWith("All") && cleanDescription.Contains("within natura range") && !cleanDescription.Contains("with at least"))
            {
                //All [[animals]] within natura range gain food|+6 and awe|+2.
                var tt = cleanDescription.Split(new[] { "within natura range" }, StringSplitOptions.None);
                OtherSource = GetResourceNames(tt[0]).ToArray();
                benefitMeta = tt[1];
                Type = "allWithinNaturaRange";
            }

            if (!String.IsNullOrEmpty(benefitMeta))
            {
                Benefits = Yield.GetYieldsFromMetaDescription(benefitMeta);
            }

            return this;
        }
    }
}
