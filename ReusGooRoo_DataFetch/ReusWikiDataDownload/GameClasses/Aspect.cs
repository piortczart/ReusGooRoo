using System;
using System.Collections.Generic;

namespace ReusWikiDataDownload.GameClasses
{
    public class Aspect
    {
        private static readonly List<string> Levels = new List<string> { "Lesser", "Potent", "Greater", "Sublime" };

        public string Strength { get; set; }
        public string Name { get; set; }
        public int Level { get; set; }

        public Aspect(string strength, string name)
        {
            Strength = strength;
            Name = name;
            int indexOfName = Levels.IndexOf(strength);
            if (indexOfName == -1)
            {
                throw new Exception("Invalid strength name: " + strength);
            }
            Level = indexOfName + 1;
        }

    }
}
