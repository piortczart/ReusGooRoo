using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace ReusWikiDataDownload.GameClasses
{
    public class Aspect
    {
        private static readonly List<string> Levels = new List<string> { "Lesser", "Potent", "Greater", "Sublime" };

        public string Strength { get; set; }
        public string Name { get; set; }
        public int Level { get; set; }
        public bool IsAnyTwoGreater { get; set; }

        public Aspect(string strength, string name, string fullText)
        {
            if (fullText.Contains("any 2 Greater"))
            {
                // This is a special case, one natural source has a different type of description.
                IsAnyTwoGreater = true;
                Name = "any";
                strength = "Greater";
            }
            else
            {
                Strength = strength;
                Name = name;

            }
            int indexOfName = Levels.IndexOf(strength);
            if (indexOfName == -1)
            {
                throw new Exception("Invalid strength name: " + strength);
            }
            Level = indexOfName + 1;
        }

    }
}
