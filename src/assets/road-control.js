export default `
<?xml version="1.0" encoding="utf-8" ?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document id="root_doc">
<Schema name="road" id="road">
	<SimpleField name="ROADNAME" type="string"></SimpleField>
	<SimpleField name="LOCATE" type="string"></SimpleField>
	<SimpleField name="BELONG" type="string"></SimpleField>
</Schema>
<Folder><name>road</name>
 <Placemark>
 <Style><LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
 <ExtendedData><SchemaData schemaUrl="#road">
	 <SimpleData name="ROADNAME">台9</SimpleData>
	 <SimpleData name="LOCATE">A,文山區</SimpleData>
	 <SimpleData name="BELONG">第一區養護工程處,景美工務段</SimpleData>
 </SchemaData></ExtendedData>
		 <MultiGeometry><LineString><coordinates>121.538151,25.008077 121.538634,25.007291 121.538962,25.006444 121.538973,25.005545 121.538827,25.004653 121.538678,25.003761 121.538686,25.002861 121.538958,25.001996 121.539297,25.001148 121.539639,25.000302 121.539981,24.999456 121.540325,24.998610 121.540666,24.997763 121.540964,24.996903 121.541151,24.996017 121.541204,24.995117 121.541141,24.994216 121.540958,24.993330 121.540655,24.992472 121.540308,24.991627 121.539969,24.990779 121.539666,24.989921 121.539572,24.989027 121.539707,24.988133 121.539871,24.987381	</coordinates></LineString></MultiGeometry>
 </Placemark>
 <Placemark>
 <Style><LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
 <ExtendedData><SchemaData schemaUrl="#road">
	 <SimpleData name="ROADNAME">台9</SimpleData>
	 <SimpleData name="LOCATE">F,新店區</SimpleData>
	 <SimpleData name="BELONG">第一區養護工程處,景美工務段</SimpleData>
 </SchemaData></ExtendedData>
		 <MultiGeometry><LineString><coordinates>121.539873,24.987372 121.540096,24.986493 121.540440,24.985647 121.540819,24.984814 121.541139,24.983960 121.541321,24.983074 121.541470,24.982181 121.541493,24.982057	</coordinates></LineString></MultiGeometry>
 </Placemark>
</Folder>
</Document></kml>
`